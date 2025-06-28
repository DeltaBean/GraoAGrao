package unit_of_measure_repository

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveUnitOfMeasure inserts a new unit into the tb_unit_of_measure table
func SaveUnitOfMeasure(conn *pgxpool.Conn, unit *model.UnitOfMeasure) error {
	logger.Log.Info("SaveUnitOfMeasure")

	query := `
		INSERT INTO tb_unit_of_measure (unit_description, created_by, store_id)
		VALUES ($1, $2, $3)
		RETURNING unit_id, unit_description, created_at, updated_at`

	err := conn.QueryRow(context.Background(), query, unit.Description, unit.CreatedBy.ID, unit.Store.ID).
		Scan(&unit.ID, &unit.Description, &unit.CreatedAt, &unit.UpdatedAt)

	if err != nil {
		logger.Log.Errorf("Error saving unit: %v", err)
		return err
	}

	logger.Log.Info("Unit successfully created")
	return nil
}

// ListUnitsPaginated returns paginated unit list
func ListUnitsPaginated(conn *pgxpool.Conn, ownerID, storeID, offset, limit uint) ([]model.UnitOfMeasure, error) {
	logger.Log.Infof("ListUnitsPaginated offset=%d limit=%d", offset, limit)

	query := `
		SELECT unit_id, unit_description, created_by, created_at, updated_at
		FROM tb_unit_of_measure
		WHERE store_id = $1
		ORDER BY created_at DESC
		OFFSET $2 LIMIT $3`

	rows, err := conn.Query(context.Background(), query,
		storeID,
		offset,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []model.UnitOfMeasure
	for rows.Next() {
		var u model.UnitOfMeasure
		err := rows.Scan(&u.ID, &u.Description, &u.CreatedBy.ID, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			continue
		}
		units = append(units, u)
	}

	return units, nil
}

// GetUnitOfMeasureByID retrieves a single unit by ID
func GetUnitOfMeasureByID(conn *pgxpool.Conn, id uint) (*model.UnitOfMeasure, error) {
	logger.Log.Infof("GetUnitOfMeasureByID: %d", id)

	query := `
		SELECT unit_id, unit_description, created_by, created_at, updated_at
		FROM tb_unit_of_measure
		WHERE unit_id = $1`

	var u model.UnitOfMeasure
	err := conn.QueryRow(context.Background(), query, id).Scan(
		&u.ID, &u.Description, &u.CreatedBy.ID, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

// UpdateUnitOfMeasure modifies an existing unit and returns the updated record
func UpdateUnitOfMeasure(conn *pgxpool.Conn, u *model.UnitOfMeasure) (*model.UnitOfMeasure, error) {
	logger.Log.Infof("UpdateUnitOfMeasure: %d", u.ID)

	query := `
		UPDATE tb_unit_of_measure
		SET unit_description = $1,
		    updated_at = NOW()
		WHERE unit_id = $2
		RETURNING unit_id, unit_description, created_at, updated_at;
	`

	updated := &model.UnitOfMeasure{}
	row := conn.QueryRow(context.Background(), query, u.Description, u.ID)

	err := row.Scan(
		&updated.ID,
		&updated.Description,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return updated, nil
}

// DeleteUnitOfMeasure removes a unit record
func DeleteUnitOfMeasure(conn *pgxpool.Conn, id uint) error {
	logger.Log.Infof("DeleteUnitOfMeasure: %d", id)

	cmd, err := conn.Exec(context.Background(),
		`DELETE FROM tb_unit_of_measure WHERE unit_id = $1`, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no unit deleted")
	}
	return nil
}

func GetReferencingItems(conn *pgxpool.Conn, id uint) (any, error) {

	rows, err := conn.Query(context.Background(), `
		SELECT item_id, item_description 
		FROM tb_item WHERE unit_id = $1`, id)
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
