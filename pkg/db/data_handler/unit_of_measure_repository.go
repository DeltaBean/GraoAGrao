package data_handler

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/jackc/pgx/v5"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// SaveUnitOfMeasure inserts a new unit into the tb_unit_of_measure table
func SaveUnitOfMeasure(unit *model.UnitOfMeasure, OwnerID uint) error {
	logger.Log.Info("SaveUnitOfMeasure")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	defer conn.Release()

	query := `
		INSERT INTO tb_unit_of_measure (unit_description, owner_id)
		VALUES ($1, $2)
		RETURNING unit_id, created_at, updated_at`

	err = conn.QueryRow(context.Background(), query, unit.Description, OwnerID).
		Scan(&unit.ID, &unit.CreatedAt, &unit.UpdatedAt)

	if err != nil {
		logger.Log.Errorf("Error saving unit: %v", err)
		return err
	}

	logger.Log.Info("Unit successfully created")
	return nil
}

// ListUnitsPaginated returns paginated unit list
func ListUnitsPaginated(ownerID uint, offset, limit uint64) ([]model.UnitOfMeasure, error) {
	logger.Log.Infof("ListUnitsPaginated offset=%d limit=%d", offset, limit)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT unit_id, unit_description, owner_id, created_at, updated_at
		FROM tb_unit_of_measure
		WHERE owner_id = $1
		ORDER BY created_at DESC
		OFFSET $2 LIMIT $3`

	rows, err := conn.Query(context.Background(), query, ownerID, offset, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []model.UnitOfMeasure
	for rows.Next() {
		var u model.UnitOfMeasure
		err := rows.Scan(&u.ID, &u.Description, &u.Owner.ID, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			continue
		}
		units = append(units, u)
	}

	return units, nil
}

// GetUnitOfMeasureByID retrieves a single unit by ID
func GetUnitOfMeasureByID(id uint) (*model.UnitOfMeasure, error) {
	logger.Log.Infof("GetUnitOfMeasureByID: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		SELECT unit_id, unit_description, owner_id, created_at, updated_at
		FROM tb_unit_of_measure
		WHERE unit_id = $1`

	var u model.UnitOfMeasure
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&u.ID, &u.Description, &u.Owner.ID, &u.CreatedAt, &u.UpdatedAt,
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
func UpdateUnitOfMeasure(u *model.UnitOfMeasure) (*model.UnitOfMeasure, error) {
	logger.Log.Infof("UpdateUnitOfMeasure: %d", u.ID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	query := `
		UPDATE tb_unit_of_measure
		SET unit_description = $1,
		    updated_at = NOW()
		WHERE unit_id = $2
		RETURNING unit_id, unit_description, created_at, updated_at;
	`

	updated := &model.UnitOfMeasure{}
	row := conn.QueryRow(context.Background(), query, u.Description, u.ID)

	err = row.Scan(
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
func DeleteUnitOfMeasure(id uint) error {
	logger.Log.Infof("DeleteUnitOfMeasure: %d", id)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		return err
	}
	defer conn.Release()

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
