package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/migration_log_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/organization_repository"
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
	scripts, err := getOrderedSQLFiles(migrationPath)
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

func getOrderedSQLFiles(migrationPath string) ([]string, error) {
	entries, err := os.ReadDir(migrationPath)
	if err != nil {
		return nil, err
	}

	var sqlFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".sql" {
			sqlFiles = append(sqlFiles, filepath.Join(migrationPath, entry.Name()))
		}
	}

	// Sort ascending
	sort.Strings(sqlFiles)

	return sqlFiles, nil
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

		// Apply only scripts not yet run
		if runScripts[scriptFile] {
			logger.Log.Infof("Skipping already run script: %s", scriptFile)
			continue
		}

		// Reading script content
		content, err := os.ReadFile(scriptPath)
		if err != nil {
			logger.Log.Errorf("failed to read migration file %s: %v", scriptFile, err)
			return err
		}

		// Appending query to set schema
		fullSQL := fmt.Sprintf("SET LOCAL search_path TO \"%s\", public;\n%s", org.DBSchema, string(content))

		logger.Log.Infof("[MIGRATION] ▶ Applying %s to schema %s", scriptFile, org.DBSchema)

		// Applying migration
		if _, err := tx.Exec(ctx, fullSQL); err != nil {
			logger.Log.Errorf("Error applying migration: %v", err)
			return err
		}

		// Logging
		if err := migration_log_repository.InsertTenantMigrationLog(ctx, tx, &model.TenantMigrationLog{
			SchemaName: org.DBSchema,
			ScriptName: scriptFile,
		}); err != nil {
			logger.Log.Errorf("Error logging migration: %v", err)
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		logger.Log.Errorf("Error committing transaction for %s: %v", org.DBSchema, err)
		return err
	}

	return nil
}
