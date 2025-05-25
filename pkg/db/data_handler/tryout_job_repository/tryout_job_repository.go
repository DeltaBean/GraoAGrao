package tryout_job_repository

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/jackc/pgx/v5"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func ListTryOutJobByStatus(status string) ([]model.TryOutJob, error) {
	logger.Log.Info("ListTryOutJobByStatus")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
        SELECT
          tjb.job_id,
          tjb.tryout_uuid,
          tjb.created_by,
          tjb.status,
          tjb.created_at,
		  org.organization_id,
		  org.schema_name,
		  org.is_try_out,
		  org.expires_at,
		  org.is_active
        FROM public.tb_tryout_job tjb
		JOIN public.tb_organization org ON org.organization_id = tjb.organization_id
        WHERE status = $1
        ORDER BY created_at ASC;
    `

	rows, err := conn.Query(context.Background(), query, status)
	if err != nil {
		logger.Log.Errorf("Error querying TryOutJob by status: %v", err)
		return nil, err
	}
	defer rows.Close()

	var jobs []model.TryOutJob
	for rows.Next() {
		var job model.TryOutJob
		if err := rows.Scan(
			&job.JobID,
			&job.TryoutUUID,
			&job.CreatedBy.ID,
			&job.Status,
			&job.CreatedAt,
			&job.Organization.ID,
			&job.Organization.DBSchema,
			&job.Organization.IsTryOut,
			&job.Organization.ExpiresAt,
			&job.Organization.IsActive,
		); err != nil {
			logger.Log.Errorf("Error scanning TryOutJob: %v", err)
			return nil, err
		}
		jobs = append(jobs, job)
	}
	if err := rows.Err(); err != nil {
		logger.Log.Errorf("Row iteration error in ListByStatus: %v", err)
		return nil, err
	}

	return jobs, nil
}

func InsertTryOutJobTx(ctx context.Context, tx pgx.Tx, job *model.TryOutJob) error {
	query := `INSERT INTO public.tb_tryout_job (tryout_uuid, created_by, organization_id, status) VALUES ($1, $2, $3, $4) RETURNING job_id, created_at`
	return tx.QueryRow(ctx, query, job.TryoutUUID, job.CreatedBy.ID, job.Organization.ID, job.Status).Scan(&job.JobID, &job.CreatedAt)
}

func ProcessTryOutJob(job *model.TryOutJob) error {
	ctx := context.Background()

	// 1) Acquire a connection
	conn, err := db.GetDB().Acquire(ctx)
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	// 2) Start a transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		logger.Log.Errorf("Error starting transaction: %v", err)
		return err
	}
	// Ensure rollback on any error
	defer func() {
		if err != nil {
			if rbErr := tx.Rollback(ctx); rbErr != nil {
				logger.Log.Errorf("Error rolling back transaction: %v", rbErr)
			}
		}
	}()

	// 3) Create the try-out schema
	schema := job.Organization.DBSchema
	createSchemaSQL := fmt.Sprintf(`CREATE SCHEMA "%s"`, schema)
	if _, err = tx.Exec(ctx, createSchemaSQL); err != nil {
		logger.Log.Errorf("Error creating schema %s: %v", schema, err)
		return err
	}

	// 4) Load all .sql migration files
	basePath := os.Getenv("PER_TENANT_MIGRATION_PATH")
	if basePath == "" {
		return fmt.Errorf("PER_TENANT_MIGRATION_PATH is not set")
	}
	pattern := filepath.Join(basePath, "*.sql")
	files, err := filepath.Glob(pattern)
	if err != nil {
		return fmt.Errorf("glob %q: %w", pattern, err)
	}
	if len(files) == 0 {
		logger.Log.Warnf("No migration files found in %s", basePath)
	}
	sort.Strings(files) // apply in name order

	// 5) Execute each migration inside the try-out schema
	for _, fullPath := range files {
		filename := filepath.Base(fullPath)
		sqlBytes, err := os.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", fullPath, err)
		}

		// Prefix to switch to the tenant schema
		fullSQL := fmt.Sprintf(
			"SET LOCAL search_path TO \"%s\", public;\n%s",
			schema,
			string(sqlBytes),
		)
		logger.Log.Infof("Applying %s to schema %s", filename, schema)

		if _, err = tx.Exec(ctx, fullSQL); err != nil {
			logger.Log.Errorf("Migration failed on %s (%s): %v", schema, filename, err)
			return err
		}
	}

	// 6) Set job status as created
	job.Status = "created"
	_, err = tx.Exec(
		ctx,
		"UPDATE tb_tryout_job SET status = $1 WHERE tryout_uuid = $2",
		job.Status,
		job.TryoutUUID,
	)
	if err != nil {
		logger.Log.Errorf("Error updating tryout job: %v", err)
		return err
	}

	// 7) Commit transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Log.Errorf("Error committing transaction: %v", err)
		return err
	}

	logger.Log.Infof("Try-out environment ready for schema %s", schema)

	return nil
}

// UpdateTryOutJob persists any changes to a TryOutJob (status) back to the database.
func UpdateTryOutJob(job *model.TryOutJob) error {
	logger.Log.Info("UpdateTryOutJob")
	ctx := context.Background()

	// 1) Acquire a connection from the pool
	conn, err := db.GetDB().Acquire(ctx)
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	// 2) Execute the UPDATE statement by UUID
	const updateSQL = `
        UPDATE public.tb_tryout_job
           SET status     = $1
         WHERE tryout_uuid = $3
    `
	cmd, err := conn.Exec(ctx, updateSQL,
		job.Status,
		job.TryoutUUID,
	)
	if err != nil {
		logger.Log.Errorf("Error updating TryOutJob %s: %v", job.TryoutUUID, err)
		return err
	}

	// 3) Ensure exactly one row was updated
	if cmd.RowsAffected() != 1 {
		return fmt.Errorf("no TryOutJob found with uuid %s", job.TryoutUUID)
	}

	logger.Log.Infof("TryOutJob %s updated: status=%s",
		job.TryoutUUID,
		job.Status,
	)
	return nil
}

func GetTryOutJobStatusByUuid(uuid string) (string, error) {
	// 1) Acquire a DB connection
	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return "", err
	}
	defer conn.Release()

	// 2) Query status
	var status string
	query := `
        SELECT status
        FROM public.tb_tryout_job
        WHERE tryout_uuid = $1
    `
	err = conn.QueryRow(context.Background(), query, uuid).Scan(&status)
	if err != nil {

		if err == sql.ErrNoRows {
			logger.Log.Infof("No Try Out jobs found with uuid %s", uuid)
			return "", err
		}

		logger.Log.Errorf("QueryRow error for UUID %s: %v", uuid, err)
		return "", err
	}

	return status, nil
}

func DestroyTryOutEnvironment(organizationID uint) error {
	logger.Log.Infof("DestroyTryOutEnvironment <organizationID>:%d", organizationID)

	ctx := context.Background()
	conn, err := db.GetDB().Acquire(ctx)
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	// Begin transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		logger.Log.Errorf("Error starting transaction: %v", err)
		return err
	}
	defer func() {
		if err != nil {
			if rbErr := tx.Rollback(ctx); rbErr != nil {
				logger.Log.Errorf("Error rolling back transaction: %v", rbErr)
			}
		}
	}()

	// Step 1: Get the schema name
	var schemaName string
	err = tx.QueryRow(ctx, `
		SELECT schema_name 
		FROM public.tb_organization 
		WHERE organization_id = $1
	`, organizationID).Scan(&schemaName)
	if err != nil {
		logger.Log.Errorf("Error querying schema name: %v", err)
		return err
	}

	// Step 2: Drop schema cascade
	dropSCHQuery := fmt.Sprintf(`DROP SCHEMA IF EXISTS "%s" CASCADE;`, schemaName)
	_, err = tx.Exec(ctx, dropSCHQuery)
	if err != nil {
		logger.Log.Errorf("Error dropping schema: %v", err)
		return err
	}

	// Step 3: Deactive the organization record
	_, err = tx.Exec(ctx, `
		UPDATE public.tb_organization
		SET is_active = $1 
		WHERE organization_id = $2
	`, false, organizationID)
	if err != nil {
		logger.Log.Errorf("Error deactivating organization record: %v", err)
		return err
	}

	// Step 4: Deactivating related organization users
	_, err = tx.Exec(ctx, `
		UPDATE public.tb_user
		SET is_active = $1
		WHERE organization_id = $2
	`, false, organizationID)
	if err != nil {
		logger.Log.Errorf("Error deleting user record: %v", err)
		return err
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Log.Errorf("Error committing transaction: %v", err)
		return err
	}

	logger.Log.Infof("Schema %s dropped and organization %d deleted successfully", schemaName, organizationID)
	return nil
}
