package stock_waste_repository

import (
	"context"
	"errors"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SaveStockWaste inserts a new stock waste entry into the tb_stock_waste table
func SaveStockWaste(conn *pgxpool.Conn, waste *model.StockWaste, storeId uint) error {
	logger.Log.Info("SaveStockWaste")

	query := `
		INSERT INTO tb_stock_waste (
			item_id, wasted_quantity, reason_text, reason_image_url, store_id, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING stock_waste_id, created_at, status;
	`

	err := conn.QueryRow(context.Background(), query,
		waste.Item.ID,
		waste.WastedQuantity,
		waste.ReasonText,
		waste.ReasonImageURL,
		storeId,
		waste.CreatedBy.ID,
	).Scan(
		&waste.StockWasteID,
		&waste.CreatedAt,
		&waste.Status,
	)

	if err != nil {
		logger.Log.Errorf("Error saving stock waste: %v", err)
		return err
	}

	logger.Log.Info("Stock waste successfully created")
	return nil
}

func GetStockWasteByID(conn *pgxpool.Conn, stockWasteID int) (*model.StockWaste, error) {
	logger.Log.Infof("GetStockWasteByID: %d", stockWasteID)

	query := `
		SELECT 
			sw.stock_waste_id,
			sw.wasted_quantity,
			sw.status,
			sw.reason_text,
			sw.reason_image_url,
			sw.created_by,
			sw.created_at,
			sw.finalized_at,
			i.item_id,
			i.item_description,
			u.unit_description,
			u.unit_id,
			c.category_description,
			c.category_id
		FROM tb_stock_waste sw
		JOIN tb_item i ON sw.item_id = i.item_id
		JOIN tb_unit_of_measure u ON i.unit_id = u.unit_id
		JOIN tb_category c ON i.category_id = c.category_id
		WHERE sw.stock_waste_id = $1;
	`

	var waste model.StockWaste

	err := conn.QueryRow(context.Background(), query, stockWasteID).Scan(
		&waste.StockWasteID,
		&waste.WastedQuantity,
		&waste.Status,
		&waste.ReasonText,
		&waste.ReasonImageURL,
		&waste.CreatedBy.ID,
		&waste.CreatedAt,
		&waste.FinalizedAt,
		&waste.Item.ID,
		&waste.Item.Description,
		&waste.Item.UnitOfMeasure.Description,
		&waste.Item.UnitOfMeasure.ID,
		&waste.Item.Category.Description,
		&waste.Item.Category.ID,
	)

	if err != nil {
		logger.Log.Errorf("Error fetching stock waste by ID: %v", err)
		return nil, err
	}

	return &waste, nil
}

func ListStockWaste(conn *pgxpool.Conn, offset, limit, storeId uint) ([]*model.StockWaste, error) {
	logger.Log.Infof("ListStockWaste: offset=%d, limit=%d", offset, limit)

	query := `
		SELECT 
			sw.stock_waste_id,
			sw.wasted_quantity,
			sw.status,
			sw.reason_text,
			sw.reason_image_url,
			sw.created_by,
			sw.created_at,
			sw.finalized_at,
			i.item_id,
			i.item_description,
			u.unit_description,
			u.unit_id,
			c.category_description,
			c.category_id
		FROM tb_stock_waste sw
		JOIN tb_item i ON sw.item_id = i.item_id
		JOIN tb_unit_of_measure u ON i.unit_id = u.unit_id
		JOIN tb_category c ON i.category_id = c.category_id
		WHERE sw.store_id = $1
		ORDER BY sw.created_at DESC
		OFFSET $2 LIMIT $3;
	`

	rows, err := conn.Query(context.Background(), query, storeId, offset, limit)
	if err != nil {
		logger.Log.Errorf("Error listing stock waste: %v", err)
		return nil, err
	}
	defer rows.Close()

	var results []*model.StockWaste

	for rows.Next() {
		var waste model.StockWaste
		err := rows.Scan(
			&waste.StockWasteID,
			&waste.WastedQuantity,
			&waste.Status,
			&waste.ReasonText,
			&waste.ReasonImageURL,
			&waste.CreatedBy.ID,
			&waste.CreatedAt,
			&waste.FinalizedAt,
			&waste.Item.ID,
			&waste.Item.Description,
			&waste.Item.UnitOfMeasure.Description,
			&waste.Item.UnitOfMeasure.ID,
			&waste.Item.Category.Description,
			&waste.Item.Category.ID,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning row in stock waste list: %v", err)
			return nil, err
		}
		results = append(results, &waste)
	}

	return results, nil
}

// UpdateStockWaste updates the fields of a stock waste entry
func UpdateStockWaste(conn *pgxpool.Conn, waste *model.StockWaste) error {
	logger.Log.Infof("UpdateStockWaste id=%d", waste.StockWasteID)

	query := `
		UPDATE tb_stock_waste
		SET 
			item_id = $1,
			wasted_quantity = $2,
			reason_text = $3,
			reason_image_url = $4
			WHERE stock_waste_id = $5
		RETURNING created_at;
	`

	err := conn.QueryRow(context.Background(), query,
		waste.Item.ID,
		waste.WastedQuantity,
		waste.ReasonText,
		waste.ReasonImageURL,
		waste.StockWasteID,
	).Scan(&waste.CreatedAt)

	if err != nil {
		logger.Log.Errorf("Error updating stock waste: %v", err)
		return err
	}

	logger.Log.Info("Stock waste successfully updated.")
	return nil
}

// FinalizeStockWasteByID sets the status of the given stock-waste to 'finalized'
// and sets finalized_at timestamp.
func FinalizeStockWasteByID(conn *pgxpool.Conn, stockWasteID int) error {
	logger.Log.Infof("FinalizeStockWaste id=%d", stockWasteID)

	_, err := conn.Exec(context.Background(), `
		UPDATE tb_stock_waste
		SET status = 'finalized'
		WHERE stock_waste_id = $1
	`, stockWasteID)

	if err != nil {
		logger.Log.Errorf("Error finalizing stock_waste: %v", err)

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			return pgErr
		}
		return err
	}

	logger.Log.Info("StockWaste finalized successfully.")
	return nil
}

// DeleteStockWasteByID deletes a stock waste record by its ID
func DeleteStockWasteByID(conn *pgxpool.Conn, stockWasteID int) error {
	logger.Log.Infof("DeleteStockWaste id=%d", stockWasteID)

	_, err := conn.Exec(context.Background(), `
		DELETE FROM tb_stock_waste
		WHERE stock_waste_id = $1
	`, stockWasteID)

	if err != nil {
		logger.Log.Errorf("Error deleting stock_waste: %v", err)

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			return pgErr
		}
		return err
	}

	logger.Log.Info("StockWaste deleted successfully.")
	return nil
}
