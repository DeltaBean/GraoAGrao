// item_packaging_repository.go
package item_packaging_repository

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveItemPackaging inserts a new packaging into the tb_item_packaging table,
// and returns the item description via a CTE join.
func SaveItemPackaging(conn *pgxpool.Conn, packaging *model.ItemPackaging) error {
	logger.Log.Info("SaveItemPackaging")

	query := `
		WITH inserted AS (
			INSERT INTO tb_item_packaging (item_id, item_packaging_description, quantity, created_by, store_id, ean_8, label_pdf_url, label_preview_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING item_packaging_id, item_packaging_description, item_id, created_by, quantity, created_at, updated_at
		)
		SELECT
			i.item_packaging_id,
			i.item_packaging_description,
			i.item_id,
			it.item_description,
			i.quantity,
			i.created_by,
			i.created_at,
			i.updated_at,
			cat.category_description,
			uom.unit_description,
			it.is_fractionable
		FROM inserted i
		JOIN tb_item it ON i.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON it.unit_id = uom.unit_id;
	`

	err := conn.QueryRow(context.Background(), query,
		packaging.Item.ID,
		packaging.Description,
		packaging.Quantity,
		packaging.CreatedBy.ID,
		packaging.Store.ID,
		packaging.EAN8,
		packaging.LabelPDFURL,
		packaging.LabelPreviewURL,
	).Scan(
		&packaging.ID,
		&packaging.Description,
		&packaging.Item.ID,
		&packaging.Item.Description,
		&packaging.Quantity,
		&packaging.CreatedBy.ID,
		&packaging.CreatedAt,
		&packaging.UpdatedAt,
		&packaging.Item.Category.Description,
		&packaging.Item.UnitOfMeasure.Description,
		&packaging.Item.IsFractionable,
	)

	if err != nil {
		logger.Log.Errorf("Error saving item packaging: %v", err)
		return err
	}

	logger.Log.Info("Item packaging successfully created with item description")
	return nil
}

// ListItemPackagingsPaginated returns a paginated list of packagings
func ListItemPackagingsPaginated(conn *pgxpool.Conn, ownerID, storeID, offset, limit uint) ([]model.ItemPackaging, error) {
	logger.Log.Infof("ListItemPackagingsPaginated offset=%d limit=%d", offset, limit)

	query := `
		SELECT sp.item_packaging_id, sp.item_packaging_description, sp.quantity,
			sp.ean_8, sp.label_pdf_url, sp.label_preview_url,
		    i.item_id, i.item_description,
		    sp.created_by, sp.created_at, sp.updated_at,
			cat.category_id, cat.category_description,
			uom.unit_id, uom.unit_description, i.is_fractionable
		FROM tb_item_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
		JOIN tb_category cat ON i.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE sp.store_id = $1
		ORDER BY sp.created_at DESC
		OFFSET $2 LIMIT $3`

	rows, err := conn.Query(context.Background(), query,
		storeID,
		offset,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.ItemPackaging
	for rows.Next() {
		var p model.ItemPackaging
		err := rows.Scan(
			&p.ID,
			&p.Description,
			&p.Quantity,
			&p.EAN8,
			&p.LabelPDFURL,
			&p.LabelPreviewURL,
			&p.Item.ID,
			&p.Item.Description,
			&p.CreatedBy.ID,
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.Item.Category.ID,
			&p.Item.Category.Description,
			&p.Item.UnitOfMeasure.ID,
			&p.Item.UnitOfMeasure.Description,
			&p.Item.IsFractionable,
		)
		if err != nil {
			continue
		}
		results = append(results, p)
	}

	return results, nil
}

// GetItemPackagingByID retrieves a single packaging by ID
func GetItemPackagingByID(conn *pgxpool.Conn, id uint) (*model.ItemPackaging, error) {
	logger.Log.Infof("GetItemPackagingByID: %d", id)

	query := `
		SELECT sp.item_packaging_id, sp.item_packaging_description, sp.quantity,
			sp.ean_8, sp.label_pdf_url, sp.label_preview_url,       
			i.item_id, i.item_description,
		    sp.created_by, sp.created_at, sp.updated_at,
			cat.category_id, cat.category_description,
			uom.unit_id, uom.unit_description, i.is_fractionable
		FROM tb_item_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
		JOIN tb_category cat ON i.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE sp.item_packaging_id = $1`

	var p model.ItemPackaging
	err := conn.QueryRow(context.Background(), query, id).Scan(
		&p.ID,
		&p.Description,
		&p.Quantity,
		&p.EAN8,
		&p.LabelPDFURL,
		&p.LabelPreviewURL,
		&p.Item.ID,
		&p.Item.Description,
		&p.CreatedBy.ID,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.Item.Category.ID,
		&p.Item.Category.Description,
		&p.Item.UnitOfMeasure.ID,
		&p.Item.UnitOfMeasure.Description,
		&p.Item.IsFractionable,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &p, nil
}

// UpdateItemPackaging modifies an existing record and returns the updated entity,
// including the joined item description from tb_item.
func UpdateItemPackaging(conn *pgxpool.Conn, p *model.ItemPackaging) (*model.ItemPackaging, error) {
	logger.Log.Infof("UpdateItemPackaging: %d", p.ID)

	query := `
		WITH updated AS (
			UPDATE tb_item_packaging
			SET item_id = $1,
			    item_packaging_description = $2,
			    quantity = $3,
			    updated_at = NOW()
			WHERE item_packaging_id = $4
			RETURNING item_packaging_id, item_id, item_packaging_description, quantity, created_by, created_at, updated_at
		)
		SELECT
			u.item_packaging_id,
			u.item_id,
			it.item_description,
			u.item_packaging_description,
			u.quantity,
			u.created_by,
			u.created_at,
			u.updated_at,
			cat.category_id, 
			cat.category_description,
			uom.unit_id, 
			uom.unit_description,
			it.is_fractionable
		FROM updated u
		JOIN tb_item it ON u.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON it.unit_id = uom.unit_id;
	`

	updated := &model.ItemPackaging{}
	row := conn.QueryRow(context.Background(), query,
		p.Item.ID,
		p.Description,
		p.Quantity,
		p.ID,
	)

	err := row.Scan(
		&updated.ID,
		&updated.Item.ID,
		&updated.Item.Description,
		&updated.Description,
		&updated.Quantity,
		&updated.CreatedBy.ID,
		&updated.CreatedAt,
		&updated.UpdatedAt,
		&p.Item.Category.ID,
		&p.Item.Category.Description,
		&p.Item.UnitOfMeasure.ID,
		&p.Item.UnitOfMeasure.Description,
		&p.Item.IsFractionable,
	)

	if err != nil {
		logger.Log.Errorf("Error scanning updated item packaging: %v", err)
		return nil, err
	}

	logger.Log.Info("Item packaging successfully updated with item description")
	return updated, nil
}

// DeleteItemPackaging removes a packaging record
func DeleteItemPackaging(conn *pgxpool.Conn, id uint) error {
	logger.Log.Infof("DeleteItemPackaging: %d", id)

	cmd, err := conn.Exec(context.Background(),
		`DELETE FROM tb_item_packaging WHERE item_packaging_id = $1`, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no item packaging deleted")
	}
	return nil
}

func GetLabelPreviewByID(conn *pgxpool.Conn, id uint) (string, error) {
	logger.Log.Infof("GetLabelPreviewByID: %d", id)

	query := `
		SELECT ip.label_preview_url
		FROM tb_item_packaging ip
		WHERE ip.item_packaging_id = $1
	`

	row := conn.QueryRow(context.Background(), query, id)

	var url string
	err := row.Scan(&url)
	if err != nil {
		logger.Log.Error(err)
		return "", err
	}

	return url, nil
}

func GetLabelPDFURLByID(conn *pgxpool.Conn, id uint) (string, error) {
	logger.Log.Infof("GetLabelPDFURLByID: %d", id)

	query := `
		SELECT ip.label_pdf_url
		FROM tb_item_packaging ip
		WHERE ip.item_packaging_id = $1
	`

	row := conn.QueryRow(context.Background(), query, id)

	var url string
	err := row.Scan(&url)
	if err != nil {
		logger.Log.Error(err)
		return "", err
	}

	return url, nil
}
