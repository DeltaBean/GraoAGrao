package migration_log_repository

import (
	"context"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

func InsertTenantMigrationLog(ctx context.Context, tx pgx.Tx, tml *model.TenantMigrationLog) error {
	query := `
		INSERT INTO tb_tenant_migration_log (schema_name, script_name)
		VALUES ($1, $2)
		RETURNING applied_at
	`
	return tx.QueryRow(ctx, query, tml.SchemaName, tml.ScriptName).Scan(&tml.AppliedAt)
}

func ListTenantMigrationLogBySchemaName(schnm string) ([]model.TenantMigrationLog, error) {

	// Acquire a connection
	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT schema_name, script_name, applied_at FROM tb_tenant_migration_log WHERE schema_name = $1
	`

	rows, err := conn.Query(context.Background(), query, schnm)
	if err != nil {
		logger.Log.Errorf("Error querying items: %v", err)
		return nil, err
	}
	defer rows.Close()

	var tmls []model.TenantMigrationLog

	for rows.Next() {
		var tml model.TenantMigrationLog

		err := rows.Scan(
			&tml.SchemaName,
			&tml.ScriptName,
			&tml.AppliedAt,
		)

		if err != nil {
			logger.Log.Errorf("Error scanning TenantMigrationLog row: %v", err)
			return nil, err
		}

		tmls = append(tmls, tml)
	}

	return tmls, nil
}
