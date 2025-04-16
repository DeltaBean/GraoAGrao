// item_repository.go
package data_handler

import (
	"context"
	"fmt"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

// SaveItem inserts a new item into the tb_item table
func SaveItem(item *model.Item, ownerID int) error {
	logger.Log.Info("SaveItem")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	query := `
		INSERT INTO tb_item (item_description, ean13, category_id, owner_id)
		VALUES ($1, $2, $3, $4)
		RETURNING item_id, created_at, updated_at`

	err = conn.QueryRow(context.Background(), query,
		item.Description,
		item.EAN13,
		item.Category.ID,
		ownerID,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)

	if err != nil {
		logger.Log.Errorf("Error saving item: %v", err)
		return err
	}

	logger.Log.Info("Item successfully created")
	return nil
}

// GetItemByID retrieves an item from the tb_item table by ID
func GetItemByID(id int) (*model.Item, error) {
	logger.Log.Info("GetItemByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT i.item_id, i.item_description, i.ean13, 
			c.category_description, c.category_id,
		    u.user_id, i.created_at, i.updated_at
		FROM tb_item i
		JOIN tb_user u ON i.owner_id = u.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		WHERE i.item_id = $1`

	item := &model.Item{}
	owner := model.User{}

	err = conn.QueryRow(context.Background(), query, id).Scan(
		&item.ID,
		&item.Description,
		&item.EAN13,
		&item.Category.Description,
		&item.Category.ID,
		&owner.ID,
		&item.CreatedAt,
		&item.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Log.Infof("No item found with id: %d", id)
			return nil, nil
		}
		logger.Log.Errorf("Error fetching item: %v", err)
		return nil, err
	}

	item.Owner = owner
	logger.Log.Info("Item successfully retrieved")
	return item, nil
}

// UpdateItem updates an existing item in the tb_item table
func UpdateItem(item *model.Item) error {
	logger.Log.Info("UpdateItem")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	query := `
		UPDATE tb_item
		SET item_description = $1,
		    ean13 = $2,
		    category_id = $3
		WHERE item_id = $4`

	cmdTag, err := conn.Exec(context.Background(), query,
		item.Description,
		item.EAN13,
		item.Category.ID,
		item.ID,
	)
	if err != nil {
		logger.Log.Errorf("Error updating item: %v", err)
		return err
	}
	if cmdTag.RowsAffected() != 1 {
		return fmt.Errorf("no item updated")
	}

	logger.Log.Info("Item successfully updated")
	return nil
}

// DeleteItem deletes an item from the tb_item table by ID
func DeleteItem(id int) error {
	logger.Log.Info("DeleteItem")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

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
func ListItems(ownerID int) ([]model.Item, error) {
	logger.Log.Info("ListItems")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT i.item_id, i.item_description, i.ean13, 
		c.category_description, c.category_id, u.user_id,
		i.created_at, i.updated_at
		FROM tb_item i
		JOIN tb_user u ON i.owner_id = u.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		WHERE i.owner_id = $1`

	rows, err := conn.Query(context.Background(), query, ownerID)
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
			&item.Category.Description,
			&item.Category.ID,
			&owner.ID,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning item row: %v", err)
			continue
		}
		item.Owner = owner
		items = append(items, item)
	}

	logger.Log.Infof("Retrieved %d items", len(items))
	return items, nil
}
