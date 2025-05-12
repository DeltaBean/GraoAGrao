package model

import "time"

type UnitOfMeasure struct {
	ID          uint
	Description string

	CreatedBy User

	CreatedAt time.Time
	UpdatedAt time.Time
}
