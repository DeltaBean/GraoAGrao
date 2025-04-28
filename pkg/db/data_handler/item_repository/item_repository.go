// item_repository.go
package item_repository

import (
	"context"
	"fmt"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

// SaveItem inserts a new item into the tb_item table
func SaveItem(item *model.Item, OwnerID uint) error {
	logger.Log.Info("SaveItem")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	query := `
		WITH inserted AS (
  			INSERT INTO tb_item (item_description, ean13, category_id, unit_id, owner_id)
  			VALUES ($1, $2, $3, $4, $5)
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

	err = conn.QueryRow(context.Background(), query,
		item.Description,
		item.EAN13,
		item.Category.ID,
		item.UnitOfMeasure.ID,
		OwnerID,
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
func GetItemByID(id uint) (*model.Item, error) {
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
			unt.unit_description, unt.unit_id,
		    usr.user_id, i.created_at, i.updated_at
		FROM tb_item i
		JOIN tb_user usr ON i.owner_id = usr.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		JOIN tb_unit_of_measure unt ON i.unit_id = unt.unit_id
		WHERE i.item_id = $1`

	item := &model.Item{}
	owner := model.User{}

	err = conn.QueryRow(context.Background(), query, id).Scan(
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

func UpdateItem(item *model.Item) (*model.Item, error) {
	logger.Log.Info("UpdateItem")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		WITH updated AS (
			UPDATE tb_item
			SET item_description = $1,
				ean13            = $2,
				category_id      = $3,
				unit_id          = $4
			WHERE item_id = $5
			RETURNING item_id, item_description, ean13, category_id, unit_id, owner_id, created_at, updated_at
		)
		SELECT 
			u.item_id,
			u.item_description,
			u.ean13,
			u.created_at,
			u.updated_at,
			u.category_id,
			c.category_description,
			u.unit_id,
			um.unit_description,
			u.owner_id
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
		item.ID,
	)

	err = row.Scan(
		&updated.ID,
		&updated.Description,
		&updated.EAN13,
		&updated.CreatedAt,
		&updated.UpdatedAt,
		&updated.Category.ID,
		&updated.Category.Description,
		&updated.UnitOfMeasure.ID,
		&updated.UnitOfMeasure.Description,
		&updated.Owner.ID,
	)
	if err != nil {
		logger.Log.Errorf("Error scanning updated item: %v", err)
		return nil, err
	}

	logger.Log.Info("Item successfully updated with category and unit info")
	return updated, nil
}

// DeleteItem deletes an item from the tb_item table by ID
func DeleteItem(id uint) error {
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
func ListItems(OwnerID uint) ([]model.Item, error) {
	logger.Log.Info("ListItems")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT i.item_id, i.item_description, i.ean13, 
		c.category_description, c.category_id, 
		unt.unit_description, unt.unit_id,
		u.user_id,
		i.created_at, i.updated_at
		FROM tb_item i
		JOIN tb_user u ON i.owner_id = u.user_id
		JOIN tb_category c ON i.category_id = c.category_id
		JOIN tb_unit_of_measure unt ON i.unit_id = unt.unit_id
		WHERE i.owner_id = $1`

	rows, err := conn.Query(context.Background(), query, OwnerID)
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
		item.Owner = owner
		items = append(items, item)
	}

	logger.Log.Infof("Retrieved %d items", len(items))
	return items, nil
}

func GetReferencingItemPackagings(id uint) (any, error) {
	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

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
