package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/db/migrations/per_tenant"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/migration_log_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/organization_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/migrations/register"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	// Initializes db
	db.InitDB()
	ctx := context.Background()

	// Acquire a connection
	conn, err := db.GetDB().Acquire(ctx)
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		os.Exit(1)
	}
	defer conn.Release()

	// Getting sql path from enviroment
	migrationPath := os.Getenv("PER_TENANT_MIGRATION_PATH")
	if migrationPath == "" {
		panic("PER_TENANT_MIGRATION_PATH not set")
	}

	// Getting script paths
	scripts, err := getOrderedMigrationFiles(migrationPath)
	if err != nil {
		logger.Log.Errorf("Error fetching scripts paths: %v", err)
		os.Exit(1)
	}

	// Querying all organizations
	orgs, err := organization_repository.ListOrganizations()
	if err != nil {
		logger.Log.Errorf("Error querying organizations: %v", err)
		os.Exit(1)
	}

	// Iterating organizations and check for not runned migration.
	for _, org := range orgs {
		start := time.Now()
		logger.Log.Infof("[MIGRATION] 🚀 Starting migrations for schema: %s", org.DBSchema)

		err = applyMigrationPerTenant(ctx, conn, org, scripts)
		if err != nil {
			logger.Log.Errorf("[MIGRATION] ❌ Failed schema %s: %v", org.DBSchema, err)
			continue
		}

		duration := time.Since(start)
		logger.Log.Infof("[MIGRATION] ✅ Finished migrations for schema: %s (took %s)", org.DBSchema, duration)
	}

}

func getOrderedMigrationFiles(migrationPath string) ([]string, error) {
	entries, err := os.ReadDir(migrationPath)
	if err != nil {
		return nil, err
	}

	// Map: script name (e.g. 00023.sql, 00029.go) -> full path or "" if .go
	scriptMap := map[string]string{}

	// 1. Collect all .sql files from disk
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".sql" {
			scriptMap[entry.Name()] = filepath.Join(migrationPath, entry.Name())
		}
	}

	// 2. Collect all registered .go scripts
	for name := range register.Migrations {
		if _, exists := scriptMap[name]; exists {
			return nil, fmt.Errorf("duplicate migration name: %s", name)
		}
		scriptMap[name] = "" // empty means it's a registered Go migration
	}

	// 3. Sort by key name
	var ordered []string
	for name := range scriptMap {
		ordered = append(ordered, name)
	}
	sort.Strings(ordered)

	// 4. Rebuild final list with full paths or Go keys
	var final []string
	for _, name := range ordered {
		path := scriptMap[name]
		if path != "" {
			final = append(final, path)
		} else {
			final = append(final, name) // just name of go file
		}
	}

	return final, nil
}

func applyMigrationPerTenant(ctx context.Context, conn *pgxpool.Conn, org model.Organization, scripts []string) (err error) {
	// Start a transaction for that organization
	tx, err := conn.Begin(ctx)
	if err != nil {
		logger.Log.Errorf("Error starting transaction for schema %s: %v", org.DBSchema, err)
		return err
	}
	defer func() {
		if err != nil {
			if rbErr := tx.Rollback(ctx); rbErr != nil {
				logger.Log.Errorf("Error rolling back transaction for schema %s: %v", org.DBSchema, rbErr)
			}
		}
	}()

	// Querying organization schema migration logs
	migrationLogs, err := migration_log_repository.ListTenantMigrationLogBySchemaName(org.DBSchema)
	if err != nil {
		logger.Log.Errorf("Error querying tenant migration logs: %v", err)
		return err
	}

	// Build a set of already run script names
	runScripts := make(map[string]bool)
	for _, log := range migrationLogs {
		runScripts[log.ScriptName] = true
	}

	// For each script
	for _, scriptPath := range scripts {
		scriptFile := filepath.Base(scriptPath)
		if filepath.Ext(scriptPath) == "" { // it's a .go key, not a path
			scriptFile = scriptPath
		}

		if runScripts[scriptFile] {
			logger.Log.Infof("Skipping already run script: %s", scriptFile)
			continue
		}

		ext := filepath.Ext(scriptFile)

		switch ext {
		case ".sql":
			content, err := os.ReadFile(scriptPath)
			if err != nil {
				return fmt.Errorf("failed to read %s: %w", scriptFile, err)
			}
			fullSQL := fmt.Sprintf(`SET LOCAL search_path TO "%s", public;
%s`, org.DBSchema, content)

			logger.Log.Infof("[MIGRATION] ▶ Applying SQL %s to schema %s", scriptFile, org.DBSchema)
			if _, err := tx.Exec(ctx, fullSQL); err != nil {
				return fmt.Errorf("failed executing %s: %w", scriptFile, err)
			}

		case ".go":
			fn, ok := register.Migrations[scriptFile]
			if !ok {
				return fmt.Errorf("no registered migration function for %s", scriptFile)
			}

			logger.Log.Infof("[MIGRATION] ▶ Running GO migration %s on schema %s", scriptFile, org.DBSchema)
			if err := fn(ctx, tx, org.DBSchema); err != nil {
				return fmt.Errorf("failed running %s: %w", scriptFile, err)
			}

		default:
			logger.Log.Warnf("Skipping unsupported file type: %s", scriptFile)
			continue
		}

		if err := migration_log_repository.InsertTenantMigrationLog(ctx, tx, &model.TenantMigrationLog{
			SchemaName: org.DBSchema,
			ScriptName: scriptFile,
		}); err != nil {
			return fmt.Errorf("failed logging migration %s: %w", scriptFile, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		logger.Log.Errorf("Error committing transaction for %s: %v", org.DBSchema, err)
		return err
	}

	return nil
}
