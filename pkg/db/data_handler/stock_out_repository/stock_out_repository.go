package stock_out_repository

import (
	"context"
	"errors"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgconn"
)

// SaveStockOut saves a stock-out transaction and its items with packaging breakdowns
func SaveStockOut(stockOut *model.StockOut, ownerID uint) error {
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

	// Insert parent record
	insertOut := `
		INSERT INTO tb_stock_out (owner_id)
		VALUES ($1)
		RETURNING stock_out_id, created_at, updated_at, status
	`
	err = tx.QueryRow(context.Background(), insertOut, ownerID).
		Scan(&stockOut.ID, &stockOut.CreatedAt, &stockOut.UpdatedAt, &stockOut.Status)
	if err != nil {
		logger.Log.Errorf("Error inserting stock_out: %v", err)
		return err
	}

	// Prepare statements for items and packagings
	insertItem := `
		INSERT INTO tb_stock_out_item (stock_out_id, item_id, total_quantity)
		VALUES ($1, $2, $3)
		RETURNING stock_out_item_id
	`
	insertPack := `
		INSERT INTO tb_stock_out_packaging (stock_out_item_id, item_packaging_id, quantity)
		VALUES ($1, $2, $3)
	`

	// Insert each StockOutItem and its packagings
	for i := range stockOut.Items {
		item := &stockOut.Items[i]

		err := tx.QueryRow(context.Background(), insertItem,
			stockOut.ID, item.Item.ID, item.TotalQuantity).
			Scan(&item.ID)
		if err != nil {
			logger.Log.Errorf("Error inserting stock_out item: %v", err)
			return err
		}

		for _, p := range item.Packagings {
			_, err := tx.Exec(context.Background(), insertPack,
				item.ID, p.ItemPackaging.ID, p.Quantity)
			if err != nil {
				logger.Log.Errorf("Error inserting stock_out packaging: %v", err)
				return err
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(context.Background()); err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Info("StockOut successfully created.")
	return nil
}

// ListAllStockOut returns all StockOut headers for a given owner (without items)
func ListAllStockOut(ownerID uint) ([]*model.StockOut, error) {
	logger.Log.Infof("ListAllStockOut ownerID=%d", ownerID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT stock_out_id, owner_id, created_at, updated_at, status, finalized_at
		FROM tb_stock_out
		WHERE owner_id = $1
		ORDER BY created_at DESC
	`
	rows, err := conn.Query(context.Background(), query, ownerID)
	if err != nil {
		logger.Log.Errorf("Error querying stock_out list: %v", err)
		return nil, err
	}
	defer rows.Close()

	var outs []*model.StockOut
	for rows.Next() {
		var so model.StockOut
		err := rows.Scan(
			&so.ID,
			&so.Owner.ID,
			&so.CreatedAt,
			&so.UpdatedAt,
			&so.Status,
			&so.FinalizedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning stock_out row: %v", err)
			return nil, err
		}
		so.Items = []model.StockOutItem{}
		outs = append(outs, &so)
	}

	return outs, nil
}

// GetStockOutByID retrieves a StockOut with its items and packaging breakdowns
func GetStockOutByID(id int) (*model.StockOut, error) {
	logger.Log.Info("GetStockOutByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return nil, err
	}
	defer conn.Release()

	stockOut := &model.StockOut{}
	parentQuery := `
		SELECT stock_out_id, owner_id, created_at, updated_at, status, finalized_at
		FROM tb_stock_out
		WHERE stock_out_id = $1
	`
	logger.Log.DebugSQL(parentQuery, id)
	err = conn.QueryRow(context.Background(), parentQuery, id).Scan(
		&stockOut.ID,
		&stockOut.Owner.ID,
		&stockOut.CreatedAt,
		&stockOut.UpdatedAt,
		&stockOut.Status,
		&stockOut.FinalizedAt,
	)
	if err != nil {
		logger.Log.Errorf("Error loading StockOut: %v", err)
		return nil, err
	}

	itemQuery := `
		SELECT soi.stock_out_item_id, soi.total_quantity,
		       i.item_id, i.item_description, i.is_fractionable,
		       cat.category_id, cat.category_description,
		       uom.unit_id, uom.unit_description
		FROM tb_stock_out_item soi
		JOIN tb_item i ON i.item_id = soi.item_id
		JOIN tb_category cat ON cat.category_id = i.category_id
		JOIN tb_unit_of_measure uom ON i.unit_id = uom.unit_id
		WHERE soi.stock_out_id = $1
	`
	logger.Log.DebugSQL(itemQuery, stockOut.ID)
	rows, err := conn.Query(context.Background(), itemQuery, stockOut.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.StockOutItem{}
	for rows.Next() {
		var item model.StockOutItem
		var cat model.Category
		err := rows.Scan(
			&item.ID,
			&item.TotalQuantity,
			&item.Item.ID,
			&item.Item.Description,
			&item.Item.IsFractionable,
			&cat.ID,
			&cat.Description,
			&item.Item.UnitOfMeasure.ID,
			&item.Item.UnitOfMeasure.Description,
		)
		if err != nil {
			return nil, err
		}
		item.Item.Category = cat
		item.StockOutID = stockOut.ID
		item.Packagings = []model.StockOutPackaging{}
		items = append(items, item)
	}

	idToIndex := make(map[uint]int, len(items))
	for idx, it := range items {
		idToIndex[it.ID] = idx
	}

	if len(items) > 0 {
		ids := make([]int, len(items))
		for i, it := range items {
			ids[i] = int(it.ID)
		}

		pkgQuery := `
			SELECT sop.stock_out_item_id, sop.stock_out_packaging_id,
			       sop.quantity,
			       ip.item_packaging_id, ip.item_packaging_description, ip.quantity
			FROM tb_stock_out_packaging sop
			JOIN tb_item_packaging ip ON ip.item_packaging_id = sop.item_packaging_id
			WHERE sop.stock_out_item_id = ANY($1::int[])
		`
		logger.Log.DebugSQL(pkgQuery, ids)
		pkgRows, err := conn.Query(context.Background(), pkgQuery, ids)
		if err != nil {
			return nil, err
		}
		defer pkgRows.Close()

		for pkgRows.Next() {
			var p model.StockOutPackaging
			err := pkgRows.Scan(
				&p.StockOutItemID,
				&p.ID,
				&p.Quantity,
				&p.ItemPackaging.ID,
				&p.ItemPackaging.Description,
				&p.ItemPackaging.Quantity,
			)
			if err != nil {
				return nil, err
			}
			if idx, ok := idToIndex[p.StockOutItemID]; ok {
				items[idx].Packagings = append(items[idx].Packagings, p)
			}
		}
	}

	stockOut.Items = items
	logger.Log.DebugAsJSON(stockOut)
	return stockOut, nil
}

// UpdateStockOut updates a stock-out, its items, and packagings
func UpdateStockOut(stockOut *model.StockOut) error {
	logger.Log.Infof("UpdateStockOut id=%d", stockOut.ID)

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
		`SELECT stock_out_item_id FROM tb_stock_out_item WHERE stock_out_id = $1`, stockOut.ID)
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
	insertItem := `INSERT INTO tb_stock_out_item (stock_out_id, item_id, total_quantity) VALUES ($1, $2, $3) RETURNING stock_out_item_id`
	updateItem := `UPDATE tb_stock_out_item SET total_quantity = $1, updated_at = NOW() WHERE stock_out_item_id = $2`
	deleteItem := `DELETE FROM tb_stock_out_item WHERE stock_out_item_id = $1`

	selectPack := `SELECT stock_out_packaging_id FROM tb_stock_out_packaging WHERE stock_out_item_id = $1`
	insertPack := `INSERT INTO tb_stock_out_packaging (stock_out_item_id, item_packaging_id, quantity) VALUES ($1, $2, $3)`
	updatePack := `UPDATE tb_stock_out_packaging SET item_packaging_id = $1, quantity = $2, updated_at = NOW() WHERE stock_out_packaging_id = $3`
	deletePack := `DELETE FROM tb_stock_out_packaging WHERE stock_out_packaging_id = $1`

	providedItems := map[uint]struct{}{}
	for i := range stockOut.Items {
		item := &stockOut.Items[i]

		if item.ID == 0 {
			err := tx.QueryRow(context.Background(), insertItem,
				stockOut.ID, item.Item.ID, item.TotalQuantity).
				Scan(&item.ID)
			if err != nil {
				logger.Log.Errorf("Error inserting stock_out item: %v", err)
				return err
			}
		} else {
			_, err = tx.Exec(context.Background(), updateItem,
				item.TotalQuantity, item.ID)
			if err != nil {
				logger.Log.Errorf("Error updating stock_out item: %v", err)
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
				_, err = tx.Exec(context.Background(), insertPack,
					item.ID, p.ItemPackaging.ID, p.Quantity)
				if err != nil {
					logger.Log.Errorf("Error inserting stock_out packaging: %v", err)
					return err
				}
			} else {
				_, err = tx.Exec(context.Background(), updatePack,
					p.ItemPackaging.ID, p.Quantity, p.ID)
				if err != nil {
					logger.Log.Errorf("Error updating stock_out packaging: %v", err)
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
					logger.Log.Errorf("Error deleting stock_out packaging: %v", err)
					return err
				}
			}
		}
	}

	// Delete removed items
	for id := range existingItems {
		if _, ok := providedItems[id]; !ok {
			// delete associated packagings first
			_, err = tx.Exec(context.Background(),
				`DELETE FROM tb_stock_out_packaging WHERE stock_out_item_id = $1`, id)
			if err != nil {
				logger.Log.Errorf("Error deleting stock_out packagings: %v", err)
				return err
			}

			// delete item
			_, err = tx.Exec(context.Background(), deleteItem, id)
			if err != nil {
				logger.Log.Errorf("Error deleting stock_out item: %v", err)
				return err
			}
		}
	}

	// Commit transaction
	if err := tx.Commit(context.Background()); err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Info("StockOut successfully updated.")
	return nil
}

// FinalizeStockOutByID sets the status of the given stock-out to 'finalized',
// triggering database-side validation and stock adjustments.
func FinalizeStockOutByID(stockOutID int) error {
	logger.Log.Infof("FinalizeStockOut id=%d", stockOutID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("DB connection error: %v", err)
		return err
	}
	defer conn.Release()

	// Update status to 'finalized' and set updated_at
	_, err = conn.Exec(context.Background(), `
		UPDATE tb_stock_out
		SET status = 'finalized', updated_at = NOW()
		WHERE stock_out_id = $1
	`, stockOutID)
	if err != nil {
		logger.Log.Errorf("Error finalizing stock_out: %v", err)

		// If it's a Postgres error, return it as PgError for caller handling
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			return pgErr
		}
		// otherwise just bubble it up
		return err
	}

	logger.Log.Info("StockOut finalized successfully.")
	return nil
}

// DeleteStockOut removes a StockOut, its items, and associated packagings
func DeleteStockOut(stockOutID int) error {
	logger.Log.Infof("DeleteStockOut id=%d", stockOutID)

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

	// Delete all packagings for this StockOut
	_, err = tx.Exec(context.Background(),
		`DELETE FROM tb_stock_out_packaging
		 WHERE stock_out_item_id IN (
		     SELECT stock_out_item_id FROM tb_stock_out_item WHERE stock_out_id = $1
		 )`, stockOutID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_out packagings: %v", err)
		return err
	}

	// Delete all items for this StockOut
	_, err = tx.Exec(context.Background(),
		`DELETE FROM tb_stock_out_item WHERE stock_out_id = $1`, stockOutID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_out items: %v", err)
		return err
	}

	// Delete the StockOut record
	cmd, err := tx.Exec(context.Background(),
		`DELETE FROM tb_stock_out WHERE stock_out_id = $1`, stockOutID)
	if err != nil {
		logger.Log.Errorf("Error deleting stock_out: %v", err)
		return err
	}
	if cmd.RowsAffected() == 0 {
		logger.Log.Warnf("No StockOut found with id=%d", stockOutID)
	}

	err = tx.Commit(context.Background())
	if err != nil {
		logger.Log.Errorf("Transaction commit failed: %v", err)
		return err
	}

	logger.Log.Infof("StockOut %d deleted successfully", stockOutID)
	return nil
}
