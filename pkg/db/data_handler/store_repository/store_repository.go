package store_repository

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

// SaveStore inserts a new store into the tb_store table
func SaveStore(store *model.Store, userID uint) error {
	logger.Log.Info("SaveStore")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	query := `
		INSERT INTO tb_store (store_name, created_by)
		VALUES ($1, $2)
		RETURNING store_id, store_name, created_at, updated_at`

	err = conn.QueryRow(context.Background(), query, store.Name, userID).
		Scan(&store.ID, &store.Name, &store.CreatedAt, &store.UpdatedAt)

	if err != nil {
		logger.Log.Errorf("Error saving store: %v", err)
		return err
	}

	logger.Log.Info("Store successfully created")
	return nil
}

// ListStoresPaginated returns a paginated list of stores
func ListStoresPaginated(createdBy uint, offset, limit uint64) ([]model.Store, error) {
	logger.Log.Infof("ListStoresPaginated offset=%d limit=%d", offset, limit)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT store_id, store_name, created_by, created_at, updated_at
		FROM tb_store
		WHERE created_by = $1
		ORDER BY created_at DESC
		OFFSET $2 LIMIT $3`

	rows, err := conn.Query(context.Background(), query, createdBy, offset, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stores []model.Store
	for rows.Next() {
		var s model.Store
		err := rows.Scan(&s.ID, &s.Name, &s.CreatedBy.ID, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			continue
		}
		stores = append(stores, s)
	}

	return stores, nil
}

// GetStoreByID retrieves a single store by ID
func GetStoreByID(id uint) (*model.Store, error) {
	logger.Log.Infof("GetStoreByID: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT store_id, store_name, created_by, created_at, updated_at
		FROM tb_store
		WHERE store_id = $1`

	var s model.Store
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&s.ID, &s.Name, &s.CreatedBy.ID, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

// UpdateStore modifies an existing store and returns the updated record
func UpdateStore(store *model.Store) (*model.Store, error) {
	logger.Log.Infof("UpdateStore: %d", store.ID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		UPDATE tb_store
		SET store_name = $1, updated_at = NOW()
		WHERE store_id = $2
		RETURNING store_id, store_name, created_at, updated_at;
	`

	updated := &model.Store{}
	err = conn.QueryRow(context.Background(), query, store.Name, store.ID).
		Scan(&updated.ID, &updated.Name, &updated.CreatedAt, &updated.UpdatedAt)

	if err != nil {
		return nil, err
	}
	return updated, nil
}

// DeleteStore removes a store by ID
func DeleteStore(id uint) error {
	logger.Log.Infof("DeleteStore: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

	cmd, err := conn.Exec(context.Background(), `DELETE FROM tb_store WHERE store_id = $1`, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no store deleted")
	}
	return nil
}
