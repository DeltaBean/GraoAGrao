package model

import "time"

type Category struct {
	ID          uint
	Description string

	CreatedBy User
	Store     Store

	CreatedAt time.Time
	UpdatedAt time.Time
}
