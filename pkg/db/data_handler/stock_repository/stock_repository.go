package stock_repository

import (
	"context"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetStock(conn *pgxpool.Conn, OwnerID, StoreID uint) ([]model.Stock, error) {
	logger.Log.Info("GetStock")

	query := `
		SELECT stock_id, current_stock, item_id, item_description, 
		ean13, category_description, category_id, unit_id, unit_description,
		stock_updated_at
		FROM vw_stock_summary
		WHERE store_id = $1
		ORDER BY item_description;
	`

	rows, err := conn.Query(context.Background(), query, StoreID)
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
		var unit model.UnitOfMeasure
		var owner model.User

		err := rows.Scan(
			&stock.ID,
			&stock.CurrentStock,
			&item.ID,
			&item.Description,
			&item.EAN13,
			&category.Description,
			&category.ID,
			&unit.ID,
			&unit.Description,
			&stock.UpdatedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning item row: %v", err)
			continue
		}

		owner.ID = OwnerID
		item.CreatedBy = owner
		category.CreatedBy = owner

		item.Category = category
		item.UnitOfMeasure = unit
		stock.Item = item

		stockSlice = append(stockSlice, stock)
	}

	logger.Log.Infof("Retrieved %d items from stock", len(stockSlice))
	return stockSlice, nil
}

func GetStockByCategory(conn *pgxpool.Conn, OwnerID uint, CategoryID int) ([]model.Stock, error) {
	logger.Log.Info("GetStockByCategory")

	query := `
		SELECT ist.item_stock_id, ist.current_stock,
			it.item_id, it.item_description, it.ean13, cat.category_description, cat.category_id,
		FROM tb_item_stock ist
		JOIN tb_item it ON ist.item_id = it.item_id
		JOIN tb_category cat ON it.category_id = cat.category_id
		WHERE cat.category_id = $1
	`

	rows, err := conn.Query(context.Background(), query, CategoryID)
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
		item.CreatedBy = owner
		category.CreatedBy = owner

		item.Category = category
		stock.Item = item

		stockSlice = append(stockSlice, stock)
	}

	logger.Log.Infof("Retrieved %d items from stock", len(stockSlice))
	return stockSlice, nil
}
