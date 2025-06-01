package organization_repository

import (
	"context"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

func InsertOrganizationTx(ctx context.Context, tx pgx.Tx, org *model.Organization) error {
	query := `INSERT INTO public.tb_organization (organization_name, organization_key, domain, schema_name, expires_at, is_try_out) VALUES ($1, $2, $3, $4, $5, $6) RETURNING organization_id`
	return tx.QueryRow(ctx, query, org.Name, org.Key, org.Domain, org.DBSchema, org.ExpiresAt, org.IsTryOut).Scan(&org.ID)
}

func ListOrganizations() ([]model.Organization, error) {

	// Acquire a connection
	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT 
			organization_id,
			organization_name,
			organization_key,
			domain, 
			schema_name, 
			expires_at, 
			is_active
		FROM tb_organization
	`

	rows, err := conn.Query(context.Background(), query)
	if err != nil {
		logger.Log.Errorf("Error querying organizations: %v", err)
		return nil, err
	}
	defer rows.Close()

	var orgs []model.Organization

	for rows.Next() {
		var org model.Organization

		err = rows.Scan(
			&org.ID,
			&org.Name,
			&org.Key,
			&org.Domain,
			&org.DBSchema,
			&org.ExpiresAt,
			&org.IsTryOut,
			&org.IsActive,
		)

		if err != nil {
			logger.Log.Errorf("Error querying organizations: %v", err)
			return nil, err
		}

		orgs = append(orgs, org)
	}

	return orgs, nil
}
