package model

import "time"

type Stock struct {
	ID           uint
	Item         Item
	CreatedBy    User
	CurrentStock int
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
