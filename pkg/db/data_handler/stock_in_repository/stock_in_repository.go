package stock_in_repository

import (
	"context"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveStockIn saves a stock in transaction and its items
func SaveStockIn(stockIn *model.StockIn, OwnerID uint) error {
	logger.Log.Info("SaveStockIn")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB error: %v", err)
		return err
	}
	defer conn.Release()

	tx, err := conn.Begin(context.Background())
	if err != nil {
		logger.Log.Errorf("Failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback(context.Background())

	insertStockIn := `
		INSERT INTO tb_stock_in (owner_id)
		VALUES ($1)
		RETURNING stock_in_id, created_at, updated_at
	`
	err = tx.QueryRow(context.Background(), insertStockIn, OwnerID).
		Scan(&stockIn.ID, &stockIn.CreatedAt, &stockIn.UpdatedAt)
	if err != nil {
		logger.Log.Errorf("Error inserting stock in: %v", err)
		return err
	}

	insertItem := `
		INSERT INTO tb_stock_in_item (stock_in_id, item_id, item_packaging_id, buy_price, quantity)
		VALUES ($1, $2, $3, $4, $5)
	`
	for _, item := range stockIn.Items {
		_, err := tx.Exec(context.Background(), insertItem,
			stockIn.ID, item.Item.ID, item.ItemPackaging.ID, item.BuyPrice, item.Quantity)
		if err != nil {
			logger.Log.Errorf("Error inserting stock in item: %v", err)
			return err
		}
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Info("StockIn successfully created.")
	return nil
}

// GetStockInByID retrieves a StockIn with its items
func GetStockInByID(id int) (*model.StockIn, error) {
	logger.Log.Info("GetStockInByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	stockIn := &model.StockIn{}
	query := `SELECT stock_in_id, owner_id, created_at, updated_at FROM tb_stock_in WHERE stock_in_id = $1`
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&stockIn.ID, &stockIn.Owner.ID, &stockIn.CreatedAt, &stockIn.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	itemRows, err := conn.Query(context.Background(), `
		SELECT sit.stock_in_item_id, sit.item_packaging_id, sit.buy_price, sit.quantity,
		it.item_description, it.item_id, cat.category_description
		FROM tb_stock_in_item sit
		JOIN tb_item it ON (sit.item_id = it.item_id)
		JOIN tb_category cat ON (cat.category_id = it.category_id)
		WHERE stock_in_id = $1
	`, stockIn.ID)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var stockInItem model.StockInItem
		err := itemRows.Scan(&stockInItem.ID,
			&stockInItem.ItemPackaging.ID,
			&stockInItem.BuyPrice,
			&stockInItem.Quantity,
			&stockInItem.Item.Description,
			&stockInItem.Item.ID,
			&stockInItem.Item.Category.Description,
		)
		if err != nil {
			return nil, err
		}

		stockInItem.StockInID = stockIn.ID
		stockIn.Items = append(stockIn.Items, stockInItem)
	}

	return stockIn, nil
}

func ListAllStockIn(OwnerID uint) ([]*model.StockIn, error) {
	logger.Log.Info("ListAllStockIn")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	stockIns := []*model.StockIn{}

	rows, err := conn.Query(context.Background(), `
		SELECT stock_in_id, owner_id, created_at, updated_at
		FROM tb_stock_in
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`, OwnerID)
	if err != nil {
		logger.Log.Errorf("Error querying stock_in list: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s model.StockIn
		err := rows.Scan(&s.ID, &s.Owner.ID, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}

		stockIns = append(stockIns, &s)
	}

	return stockIns, nil
}

// DeleteStockIn removes a StockIn and its items
func DeleteStockIn(id int) error {
	logger.Log.Infof("DeleteStockIn id=%d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return err
	}
	defer conn.Release()

	tx, err := conn.Begin(context.Background())
	if err != nil {
		logger.Log.Errorf("Failed to begin transaction: %v", err)
		return err
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(context.Background(), `
		DELETE FROM tb_stock_in_item WHERE stock_in_id = $1
	`, id)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_in items: %v", err)
		return err
	}

	cmdTag, err := tx.Exec(context.Background(), `
		DELETE FROM tb_stock_in WHERE stock_in_id = $1
	`, id)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_in: %v", err)
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		logger.Log.Warnf("No StockIn found with id=%d", id)
		return nil
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Commit failed: %v", err)
		return err
	}

	logger.Log.Infof("StockIn %d deleted successfully", id)
	return nil
}
