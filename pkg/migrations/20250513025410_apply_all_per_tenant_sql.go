package migrations

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"github.com/pressly/goose/v3"
)

func init() {
	goose.AddMigrationContext(upApplyAllPerTenantSql, downApplyAllPerTenantSql)
}

func upApplyAllPerTenantSql(ctx context.Context, tx *sql.Tx) error {
	// 1. Get tenant schemas
	rows, err := tx.Query(`SELECT schema_name FROM public.tb_organization`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var schemas []string
	for rows.Next() {
		var schema string
		if err := rows.Scan(&schema); err != nil {
			return err
		}
		schemas = append(schemas, schema)
	}

	basePath := os.Getenv("PER_TENANT_MIGRATION_PATH")
	if basePath == "" {
		return fmt.Errorf("PER_TENANT_MIGRATION_PATH is not set")
	}

	dryRun := os.Getenv("DRY_RUN") == "true"
	var failedSchemas []string

	for _, schema := range schemas {
		start := time.Now()
		fmt.Printf("[Goose] 🚀 Starting migrations for schema: %s\n", schema)

		for i := 2; i <= 22; i++ {
			filename := fmt.Sprintf("%05d.sql", i)
			fullPath := filepath.Join(basePath, filename)

			content, err := os.ReadFile(fullPath)
			if err != nil {
				return fmt.Errorf("failed to read migration file %s: %w", fullPath, err)
			}

			fullSQL := fmt.Sprintf("SET LOCAL search_path TO \"%s\", public;\n%s", schema, string(content))

			fmt.Printf("[Goose] ▶ Applying %s to schema %s\n", filename, schema)

			if dryRun {
				fmt.Printf("[Goose] ⚠️  Dry-run: Skipping execution for %s on schema %s\n", filename, schema)
				continue
			}

			if _, err := tx.Exec(fullSQL); err != nil {
				fmt.Printf("[Goose] ❌ Failed schema %s at file %s: %v\n", schema, filename, err)
				failedSchemas = append(failedSchemas, schema)
				break // Stop further files for this schema, but continue others
			}
		}

		duration := time.Since(start)
		fmt.Printf("[Goose] ✅ Finished migrations for schema: %s (took %s)\n", schema, duration)
	}

	if len(failedSchemas) > 0 {
		return fmt.Errorf("migration failed for schemas: %v", failedSchemas)
	}

	// Restore search_path to public
	tx.Exec("SET LOCAL search_path TO public")

	return nil
}

func downApplyAllPerTenantSql(ctx context.Context, tx *sql.Tx) error {
	return nil
}
