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

// SaveStockPackaging inserts a new packaging into the tb_stock_packaging table
func SaveStockPackaging(packaging *model.StockPackaging, ownerID int) error {
	logger.Log.Info("SaveStockPackaging")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

	query := `
		INSERT INTO tb_stock_packaging (item_id, stock_packaging_description, quantity, owner_id)
		VALUES ($1, $2, $3, $4)
		RETURNING stock_packaging_id, created_at, updated_at`

	err = conn.QueryRow(context.Background(), query,
		packaging.Item.ID,
		packaging.Description,
		packaging.Quantity,
		ownerID,
	).Scan(&packaging.ID, &packaging.CreatedAt, &packaging.UpdatedAt)

	if err != nil {
		logger.Log.Errorf("Error saving stock packaging: %v", err)
		return err
	}

	logger.Log.Info("Stock packaging successfully created")
	return nil
}

// ListStockPackagingsPaginated returns a paginated list of packagings
func ListStockPackagingsPaginated(ownerID, offset, limit int) ([]model.StockPackaging, error) {
	logger.Log.Infof("ListStockPackagingsPaginated offset=%d limit=%d", offset, limit)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT sp.stock_packaging_id, sp.stock_packaging_description, sp.quantity,
		       i.item_id, i.item_description,
		       sp.owner_id, sp.created_at, sp.updated_at
		FROM tb_stock_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
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
		err := rows.Scan(&p.ID, &p.Description, &p.Quantity, &p.Item.ID, &p.Item.Description, &p.Owner.ID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			continue
		}
		results = append(results, p)
	}

	return results, nil
}

// GetStockPackagingByID retrieves a single packaging by ID
func GetStockPackagingByID(id int) (*model.StockPackaging, error) {
	logger.Log.Infof("GetStockPackagingByID: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT sp.stock_packaging_id, sp.stock_packaging_description, sp.quantity,
		       i.item_id, i.item_description,
		       sp.owner_id, sp.created_at, sp.updated_at
		FROM tb_stock_packaging sp
		JOIN tb_item i ON sp.item_id = i.item_id
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
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &p, nil
}

// UpdateStockPackaging modifies an existing record
func UpdateStockPackaging(p *model.StockPackaging) error {
	logger.Log.Infof("UpdateStockPackaging: %d", p.ID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

	query := `
		UPDATE tb_stock_packaging
		SET item_id = $1, stock_packaging_description = $2, quantity = $3, updated_at = NOW()
		WHERE stock_packaging_id = $4`

	cmd, err := conn.Exec(context.Background(), query,
		p.Item.ID,
		p.Description,
		p.Quantity,
		p.ID,
	)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no stock packaging updated")
	}
	return nil
}

// DeleteStockPackaging removes a packaging record
func DeleteStockPackaging(id int) error {
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
