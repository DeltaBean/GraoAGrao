package model

import "time"

type ItemPackaging struct {
	ID          uint
	Item        Item
	Description string
	Quantity    float32

	Owner User

	CreatedAt time.Time
	UpdatedAt time.Time
}
