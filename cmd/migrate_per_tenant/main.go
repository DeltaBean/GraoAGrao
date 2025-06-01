package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/organization_repository"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
)

func main() {
	ctx := context.Background()

	// 1) Acquire a connection
	conn, err := db.GetDB().Acquire(ctx)
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		os.Exit(1)
	}
	defer conn.Release()

	// 2) Start a transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		logger.Log.Errorf("Error starting transaction: %v", err)
		os.Exit(1)
	}
	// Ensure rollback on any error
	defer func() {
		if err != nil {
			if rbErr := tx.Rollback(ctx); rbErr != nil {
				logger.Log.Errorf("Error rolling back transaction: %v", rbErr)
			}
		}
	}()

	orgs, err = organization_repository.ListOrganizations()

	var schemas []string
	for rows.Next() {
		var schema string
		if err := rows.Scan(&schema); err != nil {
			panic(err)
		}
		schemas = append(schemas, schema)
	}

	migrationPath := os.Getenv("PER_TENANT_MIGRATION_PATH")
	if migrationPath == "" {
		panic("PER_TENANT_MIGRATION_PATH not set")
	}

	dryRun := os.Getenv("DRY_RUN") == "true"

	for _, schema := range schemas {
		fmt.Printf("🚀 Starting migration for tenant schema: %s\n", schema)
		start := time.Now()

		for i := 2; i <= 23; i++ {
			filename := fmt.Sprintf("%05d.sql", i)
			fullPath := filepath.Join(migrationPath, filename)

			content, err := os.ReadFile(fullPath)
			if err != nil {
				panic(fmt.Errorf("failed to read file %s: %w", fullPath, err))
			}

			fullSQL := fmt.Sprintf("SET search_path TO \"%s\", public;\n%s", schema, string(content))

			if dryRun {
				fmt.Printf("⚠️ Dry-run for %s (%s)\n", schema, filename)
				continue
			}

			_, err = db.ExecContext(ctx, fullSQL)
			if err != nil {
				fmt.Printf("❌ Error in %s: %v\n", filename, err)
				break
			}

			fmt.Printf("✅ Applied %s\n", filename)
		}

		fmt.Printf("⏱️ Finished %s in %s\n\n", schema, time.Since(start))
	}
}
