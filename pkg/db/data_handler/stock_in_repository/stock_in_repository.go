package stock_in_repository

import (
	"context"
	"errors"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgconn"
)

// SaveStockIn saves a stock-in transaction and its items with packaging breakdowns
func SaveStockIn(stockIn *model.StockIn, ownerID uint) error {
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

	// Insert parent record
	insertStockIn := `
		INSERT INTO tb_stock_in (owner_id)
		VALUES ($1)
		RETURNING stock_in_id, created_at, updated_at, status
	`
	err = tx.QueryRow(context.Background(), insertStockIn, ownerID).
		Scan(&stockIn.ID, &stockIn.CreatedAt, &stockIn.UpdatedAt, &stockIn.Status)
	if err != nil {
		logger.Log.Errorf("Error inserting stock in: %v", err)
		return err
	}

	// Prepared statements for items and packagings
	insertItem := `
		INSERT INTO tb_stock_in_item (stock_in_id, item_id, buy_price, total_quantity)
		VALUES ($1, $2, $3, $4)
		RETURNING stock_in_item_id
	`
	insertPackaging := `
		INSERT INTO tb_stock_in_packaging (stock_in_item_id, item_packaging_id, quantity)
		VALUES ($1, $2, $3)
	`

	// Insert each StockInItem and its packagings
	for i := range stockIn.Items {
		item := &stockIn.Items[i]

		err := tx.QueryRow(context.Background(), insertItem,
			stockIn.ID, item.Item.ID, item.BuyPrice, item.TotalQuantity).
			Scan(&item.ID)
		if err != nil {
			logger.Log.Errorf("Error inserting stock in item: %v", err)
			return err
		}

		for _, p := range item.Packagings {
			_, err := tx.Exec(context.Background(), insertPackaging,
				item.ID, p.ItemPackaging.ID, p.Quantity)
			if err != nil {
				logger.Log.Errorf("Error inserting stock in packaging: %v", err)
				return err
			}
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

// ListAllStockIn returns all StockIn headers for a given owner (without items)
func ListAllStockIn(ownerID uint) ([]*model.StockIn, error) {
	logger.Log.Infof("ListAllStockIn ownerID=%d", ownerID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT stock_in_id, owner_id, created_at, updated_at, status, finalized_at
		FROM tb_stock_in
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`
	rows, err := conn.Query(context.Background(), query, ownerID)
	if err != nil {
		logger.Log.Errorf("Error querying stock_in list: %v", err)
		return nil, err
	}
	defer rows.Close()

	var stockIns []*model.StockIn
	for rows.Next() {
		var s model.StockIn
		err := rows.Scan(
			&s.ID,
			&s.Owner.ID,
			&s.CreatedAt,
			&s.UpdatedAt,
			&s.Status,
			&s.FinalizedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning stock_in row: %v", err)
			return nil, err
		}
		// Initialize empty items slice
		s.Items = []model.StockInItem{}
		stockIns = append(stockIns, &s)
	}

	return stockIns, nil
}

// GetStockInByID retrieves a StockIn with its items and packaging breakdowns
func GetStockInByID(id int) (*model.StockIn, error) {
	logger.Log.Info("GetStockInByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	// Load parent record
	stockIn := &model.StockIn{}
	parentQuery := `
		SELECT stock_in_id, owner_id, created_at, updated_at, status, finalized_at
		FROM tb_stock_in
		WHERE stock_in_id = $1
	`

	logger.Log.DebugSQL(parentQuery, id)

	err = conn.QueryRow(context.Background(), parentQuery, id).Scan(
		&stockIn.ID,
		&stockIn.Owner.ID,
		&stockIn.CreatedAt,
		&stockIn.UpdatedAt,
		&stockIn.Status,
		&stockIn.FinalizedAt,
	)
	if err != nil {
		logger.Log.Errorf("Error loading StockIn: %v", err)
		return nil, err
	}

	// Load items
	itemQuery := `
		SELECT sii.stock_in_item_id, sii.buy_price, sii.total_quantity,
		       i.item_id, i.item_description,
		       cat.category_id, cat.category_description,
			   uom.unit_id, uom.unit_description
		FROM tb_stock_in_item sii
		JOIN tb_item i ON i.item_id = sii.item_id
		JOIN tb_category cat ON cat.category_id = i.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE sii.stock_in_id = $1
	`

	logger.Log.DebugSQL(itemQuery, stockIn.ID)

	rows, err := conn.Query(context.Background(), itemQuery, stockIn.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.StockInItem{}

	for rows.Next() {
		var item model.StockInItem
		var cat model.Category
		err := rows.Scan(
			&item.ID,
			&item.BuyPrice,
			&item.TotalQuantity,
			&item.Item.ID,
			&item.Item.Description,
			&cat.ID,
			&cat.Description,
			&item.Item.UnitOfMeasure.ID,
			&item.Item.UnitOfMeasure.Description,
		)
		if err != nil {
			return nil, err
		}
		item.Item.Category = cat
		item.StockInID = stockIn.ID
		item.Packagings = []model.StockInPackaging{}
		items = append(items, item)
	}

	var idToIndex = make(map[uint]int, len(items))
	for idx, it := range items {
		idToIndex[it.ID] = idx
	}

	// Load packagings
	if len(items) > 0 {
		// collect item IDs
		ids := make([]int, len(items))
		for i, it := range items {
			ids[i] = int(it.ID)
		}

		pkgQuery := `
			SELECT sp.stock_in_item_id, sp.stock_in_packaging_id,
			       sp.quantity, ip.item_packaging_id, ip.item_packaging_description, ip.quantity
			FROM tb_stock_in_packaging sp
			JOIN tb_item_packaging ip ON ip.item_packaging_id = sp.item_packaging_id
			WHERE sp.stock_in_item_id = ANY($1::int[])
		`

		logger.Log.DebugSQL(pkgQuery, ids)

		pkgRows, err := conn.Query(context.Background(), pkgQuery, ids)

		if err != nil {
			return nil, err
		}
		defer pkgRows.Close()

		for pkgRows.Next() {
			var p model.StockInPackaging
			err := pkgRows.Scan(
				&p.StockInItemID,
				&p.ID,
				&p.Quantity,
				&p.ItemPackaging.ID,
				&p.ItemPackaging.Description,
				&p.ItemPackaging.Quantity,
			)
			if err != nil {
				return nil, err
			}
			if idx, ok := idToIndex[p.StockInItemID]; ok {
				items[idx].Packagings = append(items[idx].Packagings, p)
			}
		}
	}

	stockIn.Items = items
	logger.Log.DebugAsJSON(stockIn)

	return stockIn, nil
}

// UpdateStockIn updates a stock-in, its items, and packagings, including status
func UpdateStockIn(stockIn *model.StockIn) error {
	logger.Log.Infof("UpdateStockIn id=%d", stockIn.ID)

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

	// Fetch existing item IDs
	existingItems := map[uint]struct{}{}
	rows1, err := tx.Query(context.Background(),
		`SELECT stock_in_item_id FROM tb_stock_in_item WHERE stock_in_id = $1`, stockIn.ID)
	if err != nil {
		return err
	}
	for rows1.Next() {
		var id uint
		rows1.Scan(&id)
		existingItems[id] = struct{}{}
	}
	rows1.Close()

	// Prepare statements
	insertItem := `INSERT INTO tb_stock_in_item (stock_in_id, item_id, buy_price, total_quantity) VALUES ($1, $2, $3, $4) RETURNING stock_in_item_id`
	updateItem := `UPDATE tb_stock_in_item SET buy_price = $1, total_quantity = $2, updated_at = NOW() WHERE stock_in_item_id = $3`
	deleteItem := `DELETE FROM tb_stock_in_item WHERE stock_in_item_id = $1`
	selectPack := `SELECT stock_in_packaging_id FROM tb_stock_in_packaging WHERE stock_in_item_id = $1`
	insertPack := `INSERT INTO tb_stock_in_packaging (stock_in_item_id, item_packaging_id, quantity) VALUES ($1, $2, $3)`
	updatePack := `UPDATE tb_stock_in_packaging SET item_packaging_id = $1, quantity = $2, updated_at = NOW() WHERE stock_in_packaging_id = $3`
	deletePack := `DELETE FROM tb_stock_in_packaging WHERE stock_in_packaging_id = $1`

	// Process provided items
	providedItems := map[uint]struct{}{}
	for i := range stockIn.Items {
		item := &stockIn.Items[i]

		if item.ID == 0 {
			// Insert new item
			err := tx.QueryRow(context.Background(), insertItem,
				stockIn.ID, item.Item.ID, item.BuyPrice, item.TotalQuantity).
				Scan(&item.ID)
			if err != nil {
				logger.Log.Errorf("Error inserting stock in item: %v", err)
				return err
			}
		} else {
			// Update existing item
			_, err = tx.Exec(context.Background(), updateItem,
				item.BuyPrice, item.TotalQuantity, item.ID)
			if err != nil {
				logger.Log.Errorf("Error updating stock in item: %v", err)
				return err
			}
		}
		providedItems[item.ID] = struct{}{}

		// Handle packagings
		existingPacks := map[uint]struct{}{}
		r1, err := tx.Query(context.Background(), selectPack, item.ID)
		if err != nil {
			return err
		}
		for r1.Next() {
			var pid uint
			r1.Scan(&pid)
			existingPacks[pid] = struct{}{}
		}
		r1.Close()

		providedPacks := map[uint]struct{}{}
		for _, p := range item.Packagings {
			if p.ID == 0 {
				// insert new packaging
				_, err = tx.Exec(context.Background(), insertPack,
					item.ID, p.ItemPackaging.ID, p.Quantity)
				if err != nil {
					logger.Log.Errorf("Error inserting stock in packaging: %v", err)
					return err
				}
			} else {
				// update existing packaging
				_, err = tx.Exec(context.Background(), updatePack,
					p.ItemPackaging.ID, p.Quantity, p.ID)
				if err != nil {
					logger.Log.Errorf("Error updating stock in packaging: %v", err)
					return err
				}
			}
			providedPacks[p.ID] = struct{}{}
		}

		// Delete removed packagings
		for pid := range existingPacks {
			if _, ok := providedPacks[pid]; !ok {
				_, err = tx.Exec(context.Background(), deletePack, pid)
				if err != nil {
					logger.Log.Errorf("Error deleting stock in packaging: %v", err)
					return err
				}
			}
		}
	}

	// Delete removed items
	for id := range existingItems {
		if _, ok := providedItems[id]; !ok {
			// delete associated packagings first
			_, err = tx.Exec(context.Background(), `DELETE FROM tb_stock_in_packaging WHERE stock_in_item_id = $1`, id)
			if err != nil {
				logger.Log.Errorf("Error deleting packagings for item %d: %v", id, err)
				return err
			}

			// delete item
			_, err = tx.Exec(context.Background(), deleteItem, id)
			if err != nil {
				logger.Log.Errorf("Error deleting stock in item %d: %v", id, err)
				return err
			}
		}
	}

	// Commit transaction
	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Info("StockIn successfully updated.")
	return nil
}

// FinalizeStockInByID sets the status of the given stock-in to 'finalized',
// triggering the validate_stock_in_packaging_totals trigger in the database.
func FinalizeStockInByID(stockInID int) error {
	logger.Log.Infof("FinalizeStockIn id=%d", stockInID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return err
	}
	defer conn.Release()

	// Update status to 'finalized' and set updated_at
	_, err = conn.Exec(context.Background(), `
		UPDATE tb_stock_in
		SET status = 'finalized', updated_at = NOW()
		WHERE stock_in_id = $1
	`, stockInID)
	if err != nil {
		logger.Log.Errorf("Error finalizing stock_in: %v", err)

		// If it's a Postgres error, return it *as* a PgError so callers can inspect Code
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			return pgErr
		}
		// otherwise just bubble it up
		return err
	}

	logger.Log.Info("StockIn finalized successfully.")
	return nil
}

// DeleteStockIn removes a StockIn, its items, and associated packagings
func DeleteStockIn(stockInID int) error {
	logger.Log.Infof("DeleteStockIn id=%d", stockInID)

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

	// Delete all packagings for this StockIn
	_, err = tx.Exec(context.Background(),
		`DELETE FROM tb_stock_in_packaging
		 WHERE stock_in_item_id IN (
		     SELECT stock_in_item_id FROM tb_stock_in_item WHERE stock_in_id = $1
		 )`, stockInID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_in packagings: %v", err)
		return err
	}

	// Delete all items for this StockIn
	_, err = tx.Exec(context.Background(),
		`DELETE FROM tb_stock_in_item WHERE stock_in_id = $1`, stockInID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_in items: %v", err)
		return err
	}

	// Delete the StockIn record
	cmd, err := tx.Exec(context.Background(),
		`DELETE FROM tb_stock_in WHERE stock_in_id = $1`, stockInID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_in: %v", err)
		return err
	}
	if cmd.RowsAffected() == 0 {
		logger.Log.Warnf("No StockIn found with id=%d", stockInID)
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Infof("StockIn %d deleted successfully", stockInID)
	return nil
}
