// item_repository.go
package item_repository

import (
	"context"
	"fmt"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SaveItem inserts a new item into the tb_item table
func SaveItem(conn *pgxpool.Conn, item *model.Item) error {
	logger.Log.Info("SaveItem")

	query := `
		WITH inserted AS (
  			INSERT INTO tb_item (item_description, ean13, category_id, unit_id, created_by, is_fractionable, store_id)
  			VALUES ($1, $2, $3, $4, $5, $6, $7)
  			RETURNING item_id, item_description, category_id, unit_id, created_at, updated_at
		)
		SELECT 
			i.item_id,
			i.item_description,
			i.created_at,
			i.updated_at,
			c.category_description,
			u.unit_description
		FROM inserted i
			JOIN tb_category c ON i.category_id = c.category_id
			JOIN tb_unit_of_measure u ON i.unit_id = u.unit_id;	
	`

	err := conn.QueryRow(context.Background(), query,
		item.Description,
		item.EAN13,
		item.Category.ID,
		item.UnitOfMeasure.ID,
		item.CreatedBy.ID,
		item.IsFractionable,
		item.Store.ID,
	).Scan(
		&item.ID,
		&item.Description,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.Category.Description,
		&item.UnitOfMeasure.Description,
	)

	if err != nil {
		logger.Log.Errorf("Error saving item: %v", err)
		return err
	}

	logger.Log.Info("Item successfully created")
	return nil
}

// GetItemByID retrieves an item from the tb_item table by ID
func GetItemByID(conn *pgxpool.Conn, id uint) (*model.Item, error) {
	logger.Log.Info("GetItemByID")

	query := `
		SELECT i.item_id, i.item_description, i.ean13, 
			c.category_description, c.category_id,
			unt.unit_description, unt.unit_id,
		    usr.user_id, i.created_at, i.updated_at, i.is_fractionable
		FROM tb_item i
		JOIN tb_user usr ON i.created_by = usr.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		JOIN tb_unit_of_measure unt ON i.unit_id = unt.unit_id
		WHERE i.item_id = $1`

	item := &model.Item{}
	owner := model.User{}

	err := conn.QueryRow(context.Background(), query, id).Scan(
		&item.ID,
		&item.Description,
		&item.EAN13,
		&item.Category.Description,
		&item.Category.ID,
		&item.UnitOfMeasure.Description,
		&item.UnitOfMeasure.ID,
		&owner.ID,
		&item.CreatedAt,
		&item.UpdatedAt,
		&item.IsFractionable,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Log.Infof("No item found with id: %d", id)
			return nil, nil
		}
		logger.Log.Errorf("Error fetching item: %v", err)
		return nil, err
	}

	item.CreatedBy = owner
	logger.Log.Info("Item successfully retrieved")
	return item, nil
}

func UpdateItem(conn *pgxpool.Conn, item *model.Item) (*model.Item, error) {
	logger.Log.Info("UpdateItem")

	query := `
		WITH updated AS (
			UPDATE tb_item
			SET item_description = $1,
				ean13            = $2,
				category_id      = $3,
				unit_id          = $4,
				is_fractionable  = $5
			WHERE item_id = $6
			RETURNING item_id, item_description, ean13, category_id, unit_id, created_by, created_at, updated_at, is_fractionable
		)
		SELECT 
			u.item_id,
			u.item_description,
			u.ean13,
			u.is_fractionable,
			u.created_at,
			u.updated_at,
			u.category_id,
			c.category_description,
			u.unit_id,
			um.unit_description,
			u.created_by
		FROM updated u
		JOIN tb_category c ON u.category_id = c.category_id
		JOIN tb_unit_of_measure um ON u.unit_id = um.unit_id;
	`

	updated := &model.Item{}
	row := conn.QueryRow(context.Background(), query,
		item.Description,
		item.EAN13,
		item.Category.ID,
		item.UnitOfMeasure.ID,
		item.IsFractionable,
		item.ID,
	)

	err := row.Scan(
		&updated.ID,
		&updated.Description,
		&updated.EAN13,
		&updated.IsFractionable,
		&updated.CreatedAt,
		&updated.UpdatedAt,
		&updated.Category.ID,
		&updated.Category.Description,
		&updated.UnitOfMeasure.ID,
		&updated.UnitOfMeasure.Description,
		&updated.CreatedBy.ID,
	)
	if err != nil {
		logger.Log.Errorf("Error scanning updated item: %v", err)
		return nil, err
	}

	logger.Log.Info("Item successfully updated with category and unit info")
	return updated, nil
}

// DeleteItem deletes an item from the tb_item table by ID
func DeleteItem(conn *pgxpool.Conn, id uint) error {
	logger.Log.Info("DeleteItem")

	query := `DELETE FROM tb_item WHERE item_id = $1`
	cmdTag, err := conn.Exec(context.Background(), query, id)
	if err != nil {
		logger.Log.Errorf("Error deleting item: %v", err)
		return err
	}
	if cmdTag.RowsAffected() != 1 {
		return fmt.Errorf("no item deleted")
	}

	logger.Log.Info("Item successfully deleted")
	return nil
}

// ListItems returns all items with basic user info
func ListItems(conn *pgxpool.Conn, OwnerID, StoreID uint) ([]model.Item, error) {
	logger.Log.Info("ListItems")

	query := `
		SELECT i.item_id, i.item_description, i.ean13, i.is_fractionable,
		c.category_description, c.category_id, 
		unt.unit_description, unt.unit_id,
		u.user_id,
		i.created_at, i.updated_at
		FROM tb_item i
		JOIN tb_user u ON i.created_by = u.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		JOIN tb_unit_of_measure unt ON i.unit_id = unt.unit_id
		WHERE i.store_id = $1`

	rows, err := conn.Query(context.Background(), query, StoreID)
	if err != nil {
		logger.Log.Errorf("Error querying items: %v", err)
		return nil, err
	}
	defer rows.Close()

	var items []model.Item

	for rows.Next() {
		var item model.Item
		var owner model.User

		err := rows.Scan(
			&item.ID,
			&item.Description,
			&item.EAN13,
			&item.IsFractionable,
			&item.Category.Description,
			&item.Category.ID,
			&item.UnitOfMeasure.Description,
			&item.UnitOfMeasure.ID,
			&owner.ID,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning item row: %v", err)
			continue
		}
		item.CreatedBy = owner
		items = append(items, item)
	}

	logger.Log.Infof("Retrieved %d items", len(items))
	return items, nil
}

func GetReferencingItemPackagings(conn *pgxpool.Conn, id uint) (any, error) {
	rows, err := conn.Query(context.Background(), `
		SELECT item_packaging_id, item_packaging_description 
		FROM tb_item_packaging WHERE item_id = $1`, id)
	if err != nil {
		return nil, err
	}

	var result []model.ItemPackaging
	for rows.Next() {
		var ip model.ItemPackaging
		if err := rows.Scan(&ip.ID, &ip.Description); err != nil {
			return nil, err
		}
		result = append(result, ip)
	}

	return result, nil
}
