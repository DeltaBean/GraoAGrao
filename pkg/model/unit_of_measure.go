package model

import "time"

type UnitOfMeasure struct {
	ID          uint
	Description string

	CreatedBy User
	Store     Store

	CreatedAt time.Time
	UpdatedAt time.Time
}
