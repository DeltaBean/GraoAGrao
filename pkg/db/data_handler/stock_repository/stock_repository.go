package stock_repository

import (
	"context"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func GetStock(OwnerID uint) ([]model.Stock, error) {
	logger.Log.Info("GetStock")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT ist.item_stock_id, ist.current_stock,
			it.item_id, it.item_description, it.ean13, cat.category_description, cat.category_id,
		FROM tb_item_stock ist
		JOIN tb_item it ON ist.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		WHERE ist.owner_id = $1
	`

	rows, err := conn.Query(context.Background(), query, OwnerID)
	if err != nil {
		logger.Log.Errorf("Error querying items: %v", err)
		return nil, err
	}
	defer rows.Close()

	var stockSlice []model.Stock

	for rows.Next() {
		var stock model.Stock
		var item model.Item
		var category model.Category
		var owner model.User

		err := rows.Scan(
			&stock.ID,
			&stock.CurrentStock,
			&item.ID,
			&item.Description,
			&item.EAN13,
			&category.Description,
			&category.ID,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning item row: %v", err)
			continue
		}

		owner.ID = OwnerID
		item.Owner = owner
		category.Owner = owner

		item.Category = category
		stock.Item = item

		stockSlice = append(stockSlice, stock)
	}

	logger.Log.Infof("Retrieved %d items from stock", len(stockSlice))
	return stockSlice, nil
}

func GetStockByCategory(OwnerID uint, CategoryID int) ([]model.Stock, error) {
	logger.Log.Info("GetStockByCategory")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT ist.item_stock_id, ist.current_stock,
			it.item_id, it.item_description, it.ean13, cat.category_description, cat.category_id,
		FROM tb_item_stock ist
		JOIN tb_item it ON ist.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		WHERE ist.owner_id = $1 AND cat.category_id = $2
	`

	rows, err := conn.Query(context.Background(), query, OwnerID, CategoryID)
	if err != nil {
		logger.Log.Errorf("Error querying items: %v", err)
		return nil, err
	}
	defer rows.Close()

	var stockSlice []model.Stock

	for rows.Next() {
		var stock model.Stock
		var item model.Item
		var category model.Category
		var owner model.User

		err := rows.Scan(
			&stock.ID,
			&stock.CurrentStock,
			&item.ID,
			&item.Description,
			&item.EAN13,
			&category.Description,
			&category.ID,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning item row: %v", err)
			continue
		}

		owner.ID = OwnerID
		item.Owner = owner
		category.Owner = owner

		item.Category = category
		stock.Item = item

		stockSlice = append(stockSlice, stock)
	}

	logger.Log.Infof("Retrieved %d items from stock", len(stockSlice))
	return stockSlice, nil
}
