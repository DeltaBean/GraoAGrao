package organization_repository

import (
	"context"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

func InsertOrganizationTx(ctx context.Context, tx pgx.Tx, org *model.Organization) error {
	query := `INSERT INTO public.tb_organization (organization_name, organization_key, domain, schema_name) VALUES ($1, $2, $3, $4) RETURNING organization_id`
	return tx.QueryRow(ctx, query, org.Name, org.Key, org.Domain, org.DBSchema).Scan(&org.ID)
}
