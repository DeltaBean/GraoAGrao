package model

import "time"

type Item struct {
	ID             uint
	Description    string
	EAN13          string
	Category       Category
	UnitOfMeasure  UnitOfMeasure
	IsFractionable bool

	Owner User

	CreatedAt time.Time
	UpdatedAt time.Time
}
