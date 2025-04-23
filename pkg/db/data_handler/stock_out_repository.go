package data_handler

import (
	"context"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveStockOut saves a stock out transaction and its items
func SaveStockOut(StockOut *model.StockOut, OwnerID uint) error {
	logger.Log.Info("SaveStockOut")

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

	insertStockOut := `
		INSERT INTO tb_stock_out (owner_id)
		VALUES ($1)
		RETURNING stock_out_id, created_at, updated_at
	`
	err = tx.QueryRow(context.Background(), insertStockOut, OwnerID).
		Scan(&StockOut.ID, &StockOut.CreatedAt, &StockOut.UpdatedAt)
	if err != nil {
		logger.Log.Errorf("Error inserting stock out: %v", err)
		return err
	}

	insertItem := `
		INSERT INTO tb_stock_out_item (stock_out_id, item_id, buy_price, quantity)
		VALUES ($1, $2, $3, $4)
	`
	for _, item := range StockOut.Items {
		_, err := tx.Exec(context.Background(), insertItem,
			StockOut.ID, item.ID, item.Quantity)
		if err != nil {
			logger.Log.Errorf("Error inserting stock out item: %v", err)
			return err
		}
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Info("StockOut successfully created.")
	return nil
}

// GetStockOutByID retrieves a StockOut with its items
func GetStockOutByID(id int) (*model.StockOut, error) {
	logger.Log.Info("GetStockOutByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	StockOut := &model.StockOut{}
	query := `SELECT stock_out_id, owner_id, created_at, updated_at FROM tb_stock_out WHERE stock_out_id = $1`
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&StockOut.ID, &StockOut.Owner.ID, &StockOut.CreatedAt, &StockOut.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	itemRows, err := conn.Query(context.Background(), `
		SELECT stock_out_item_id, item_id, quantity
		FROM tb_stock_out_item
		WHERE stock_out_id = $1
	`, StockOut.ID)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var StockOutItem model.StockOutItem
		err := itemRows.Scan(&StockOutItem.ID, &StockOutItem.Item.ID, &StockOutItem.Quantity)
		if err != nil {
			return nil, err
		}
		StockOut.Items = append(StockOut.Items, StockOutItem)
	}

	return StockOut, nil
}

// ListAllStockOut retrieves all StockOut records with their items
func ListAllStockOut(OwnerID uint) ([]*model.StockOut, error) {
	logger.Log.Info("ListAllStockOut")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	StockOuts := []*model.StockOut{}

	rows, err := conn.Query(context.Background(), `
		SELECT stock_out_id, owner_id, created_at, updated_at
		FROM tb_stock_out
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`, OwnerID)
	if err != nil {
		logger.Log.Errorf("Error querying stock_out list: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s model.StockOut
		err := rows.Scan(&s.ID, &s.Owner.ID, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, err
		}

		StockOuts = append(StockOuts, &s)
	}

	return StockOuts, nil
}

// DeleteStockOut removes a StockOut and its items
func DeleteStockOut(id int) error {
	logger.Log.Infof("DeleteStockOut id=%d", id)

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
		DELETE FROM tb_stock_out_item WHERE stock_out_id = $1
	`, id)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_out items: %v", err)
		return err
	}

	cmdTag, err := tx.Exec(context.Background(), `
		DELETE FROM tb_stock_out WHERE stock_out_id = $1
	`, id)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_out: %v", err)
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		logger.Log.Warnf("No StockOut found with id=%d", id)
		return nil
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Commit failed: %v", err)
		return err
	}

	logger.Log.Infof("StockOut %d deleted successfully", id)
	return nil
}
