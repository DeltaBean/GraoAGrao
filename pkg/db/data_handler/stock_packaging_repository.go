// stock_packaging_repository.go
package data_handler

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/jackc/pgx/v5"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveStockPackaging inserts a new packaging into the tb_stock_packaging table,
// and returns the item description via a CTE join.
func SaveStockPackaging(packaging *model.StockPackaging, OwnerID uint) error {
	logger.Log.Info("SaveStockPackaging")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

	query := `
		WITH inserted AS (
			INSERT INTO tb_stock_packaging (item_id, stock_packaging_description, quantity, owner_id)
			VALUES ($1, $2, $3, $4)
			RETURNING stock_packaging_id, item_id, owner_id, stock_packaging_description, quantity, created_at, updated_at
		)
		SELECT
			i.stock_packaging_id,
			i.item_id,
			it.item_description,
			i.stock_packaging_description,
			i.quantity,
			i.owner_id,
			i.created_at,
			i.updated_at,
			cat.category_description,
			uom.unit_description
		FROM inserted i
		JOIN tb_item it ON i.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON it.unit_id = uom.unit_id;
	`

	err = conn.QueryRow(context.Background(), query,
		packaging.Item.ID,
		packaging.Description,
		packaging.Quantity,
		OwnerID,
	).Scan(
		&packaging.ID,
		&packaging.Item.ID,
		&packaging.Item.Description,
		&packaging.Description,
		&packaging.Quantity,
		&packaging.Owner.ID,
		&packaging.CreatedAt,
		&packaging.UpdatedAt,
		&packaging.Item.Category.Description,
		&packaging.Item.UnitOfMeasure.Description,
	)

	if err != nil {
		logger.Log.Errorf("Error saving stock packaging: %v", err)
		return err
	}

	logger.Log.Info("Stock packaging successfully created with item description")
	return nil
}

// ListStockPackagingsPaginated returns a paginated list of packagings
func ListStockPackagingsPaginated(ownerID uint, offset, limit uint64) ([]model.StockPackaging, error) {
	logger.Log.Infof("ListStockPackagingsPaginated offset=%d limit=%d", offset, limit)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT sp.stock_packaging_id, sp.stock_packaging_description, sp.quantity,
		       i.item_id, i.item_description,
		       sp.owner_id, sp.created_at, sp.updated_at,
			   cat.category_id, cat.category_description,
			   uom.unit_id, uom.unit_description
		FROM tb_stock_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
		JOIN tb_category cat ON i.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE sp.owner_id = $1
		ORDER BY sp.created_at DESC
		OFFSET $2 LIMIT $3`

	rows, err := conn.Query(context.Background(), query, ownerID, offset, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.StockPackaging
	for rows.Next() {
		var p model.StockPackaging
		err := rows.Scan(
			&p.ID,
			&p.Description,
			&p.Quantity,
			&p.Item.ID,
			&p.Item.Description,
			&p.Owner.ID,
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.Item.Category.ID,
			&p.Item.Category.Description,
			&p.Item.UnitOfMeasure.ID,
			&p.Item.UnitOfMeasure.Description,
		)
		if err != nil {
			continue
		}
		results = append(results, p)
	}

	return results, nil
}

// GetStockPackagingByID retrieves a single packaging by ID
func GetStockPackagingByID(id uint) (*model.StockPackaging, error) {
	logger.Log.Infof("GetStockPackagingByID: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT sp.stock_packaging_id, sp.stock_packaging_description, sp.quantity,
		       i.item_id, i.item_description,
		       sp.owner_id, sp.created_at, sp.updated_at,
			   cat.category_id, cat.category_description,
			   uom.unit_id, uom.unit_description
		FROM tb_stock_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
		JOIN tb_category cat ON i.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE sp.stock_packaging_id = $1`

	var p model.StockPackaging
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&p.ID,
		&p.Description,
		&p.Quantity,
		&p.Item.ID,
		&p.Item.Description,
		&p.Owner.ID,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.Item.Category.ID,
		&p.Item.Category.Description,
		&p.Item.UnitOfMeasure.ID,
		&p.Item.UnitOfMeasure.Description,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &p, nil
}

// UpdateStockPackaging modifies an existing record and returns the updated entity,
// including the joined item description from tb_item.
func UpdateStockPackaging(p *model.StockPackaging) (*model.StockPackaging, error) {
	logger.Log.Infof("UpdateStockPackaging: %d", p.ID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		WITH updated AS (
			UPDATE tb_stock_packaging
			SET item_id = $1,
			    stock_packaging_description = $2,
			    quantity = $3,
			    updated_at = NOW()
			WHERE stock_packaging_id = $4
			RETURNING stock_packaging_id, item_id, stock_packaging_description, quantity, owner_id, created_at, updated_at
		)
		SELECT
			u.stock_packaging_id,
			u.item_id,
			it.item_description,
			u.stock_packaging_description,
			u.quantity,
			u.owner_id,
			u.created_at,
			u.updated_at,
			cat.category_id, 
			cat.category_description,
			uom.unit_id, 
			uom.unit_description
		FROM updated u
		JOIN tb_item it ON u.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		JOIN tb_unit_of_measure uom ON it.unit_id = uom.unit_id;
	`

	updated := &model.StockPackaging{}
	row := conn.QueryRow(context.Background(), query,
		p.Item.ID,
		p.Description,
		p.Quantity,
		p.ID,
	)

	err = row.Scan(
		&updated.ID,
		&updated.Item.ID,
		&updated.Item.Description,
		&updated.Description,
		&updated.Quantity,
		&updated.Owner.ID,
		&updated.CreatedAt,
		&updated.UpdatedAt,
		&p.Item.Category.ID,
		&p.Item.Category.Description,
		&p.Item.UnitOfMeasure.ID,
		&p.Item.UnitOfMeasure.Description,
	)

	if err != nil {
		logger.Log.Errorf("Error scanning updated stock packaging: %v", err)
		return nil, err
	}

	logger.Log.Info("Stock packaging successfully updated with item description")
	return updated, nil
}

// DeleteStockPackaging removes a packaging record
func DeleteStockPackaging(id uint) error {
	logger.Log.Infof("DeleteStockPackaging: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

	cmd, err := conn.Exec(context.Background(),
		`DELETE FROM tb_stock_packaging WHERE stock_packaging_id = $1`, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no stock packaging deleted")
	}
	return nil
}
