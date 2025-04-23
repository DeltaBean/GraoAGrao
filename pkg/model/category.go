package model

import "time"

type Category struct {
	ID          uint
	Description string

	Owner User

	CreatedAt time.Time
	UpdatedAt time.Time
}
