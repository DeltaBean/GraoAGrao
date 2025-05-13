package category_repository

import (
	"context"
	"fmt"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SaveCategory(conn *pgxpool.Conn, category *model.Category) error {
	logger.Log.Info("SaveCategory")

	query := `
		WITH inserted AS (
			INSERT INTO tb_category (category_description, created_by, store_id)
			VALUES ($1, $2, $3)
			RETURNING category_id, category_description, created_by, created_at, updated_at
		)
		SELECT 
			c.category_id,
			c.category_description,
			c.created_by,
			c.created_at,
			c.updated_at
		FROM inserted c
	`

	err := conn.QueryRow(context.Background(), query,
		category.Description,
		category.CreatedBy.ID,
		category.Store.ID,
	).Scan(
		&category.ID,
		&category.Description,
		&category.CreatedBy.ID,
		&category.CreatedAt,
		&category.UpdatedAt,
	)

	if err != nil {
		logger.Log.Errorf("Error saving category: %v", err)
		return err
	}

	logger.Log.Info("Category successfully created with CTE")
	return nil
}

func GetCategoryByID(conn *pgxpool.Conn, id uint) (*model.Category, error) {
	logger.Log.Info("GetCategoryByID")

	query := `
		SELECT c.category_id, c.category_description, u.user_id,
		       c.created_at, c.updated_at
		FROM tb_category c
		JOIN tb_user u ON c.created_by = u.user_id
		WHERE c.category_id = $1`

	category := &model.Category{}
	err := conn.QueryRow(context.Background(), query, id).Scan(
		&category.ID,
		&category.Description,
		&category.CreatedBy.ID,
		&category.CreatedAt,
		&category.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Log.Infof("No category found with id: %d", id)
			return nil, nil
		}
		logger.Log.Errorf("Error fetching category: %v", err)
		return nil, err
	}

	logger.Log.Info("Category successfully retrieved")
	return category, nil
}

func UpdateCategory(conn *pgxpool.Conn, ownerID uint, category *model.Category) (*model.Category, error) {
	logger.Log.Info("UpdateCategory")

	// Then return all the columns you want to populate back into the model.
	query := `
        UPDATE tb_category
        SET category_description = $1
        WHERE category_id = $2
          AND created_by = $3
        RETURNING
          category_id,
          category_description,
          created_by,
          created_at,
          updated_at
    `

	// Prepare a fresh model to scan into:
	updated := &model.Category{CreatedBy: model.User{ID: ownerID}}
	row := conn.QueryRow(context.Background(), query,
		category.Description,
		category.ID,
		ownerID,
	)

	// Scan the returned columns into your model fields:
	if err := row.Scan(
		&updated.ID,
		&updated.Description,
		&updated.CreatedBy.ID,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	); err != nil {
		logger.Log.Errorf("Error updating category: %v", err)
		return nil, err
	}

	logger.Log.Info("Category successfully updated")
	return updated, nil
}

func DeleteCategory(conn *pgxpool.Conn, id uint) error {
	logger.Log.Info("DeleteCategory")

	query := `DELETE FROM tb_category WHERE category_id = $1`

	cmdTag, err := conn.Exec(context.Background(), query, id)
	if err != nil {
		logger.Log.Errorf("Error deleting category: %v", err)
		return err
	}
	if cmdTag.RowsAffected() != 1 {
		logger.Log.Infof("No category found for delete with id: %d", id)
		return fmt.Errorf("no category deleted")
	}

	logger.Log.Info("Category successfully deleted")
	return nil
}

func ListCategories(conn *pgxpool.Conn, OwnerID, StoreID uint) ([]*model.Category, error) {
	logger.Log.Info("ListCategories")

	query := `
		SELECT c.category_id, c.category_description, u.user_id,
		       c.created_at, c.updated_at
		FROM tb_category c
		JOIN tb_user u ON c.created_by = u.user_id
		WHERE c.created_by = $1 AND c.store_id = $2`

	rows, err := conn.Query(context.Background(), query, OwnerID, StoreID)
	if err != nil {
		logger.Log.Errorf("Error fetching categories: %v", err)
		return nil, err
	}
	defer rows.Close()

	categories := []*model.Category{}
	for rows.Next() {
		category := &model.Category{}
		err = rows.Scan(
			&category.ID,
			&category.Description,
			&category.CreatedBy.ID,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			logger.Log.Errorf("Error scanning category: %v", err)
			return nil, err
		}
		categories = append(categories, category)
	}

	if err = rows.Err(); err != nil {
		logger.Log.Errorf("Error iterating categories: %v", err)
		return nil, err
	}

	logger.Log.Infof("Retrieved %d categories", len(categories))
	return categories, nil
}

func GetReferencingItems(conn *pgxpool.Conn, id uint) (any, error) {
	rows, err := conn.Query(context.Background(), `
		SELECT item_id, item_description 
		FROM tb_item WHERE category_id = $1`, id)
	if err != nil {
		return nil, err
	}

	var result []model.Item
	for rows.Next() {
		var i model.Item
		if err := rows.Scan(&i.ID, &i.Description); err != nil {
			return nil, err
		}
		result = append(result, i)
	}

	return result, nil
}
