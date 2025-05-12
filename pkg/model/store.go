package model

import "time"

type Store struct {
	ID        uint
	Name      string
	CreatedBy User

	CreatedAt time.Time
	UpdatedAt time.Time
}
