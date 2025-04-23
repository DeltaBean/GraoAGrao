package model

import "time"

type UnitOfMeasure struct {
	ID          uint
	Description string

	Owner User

	CreatedAt time.Time
	UpdatedAt time.Time
}
