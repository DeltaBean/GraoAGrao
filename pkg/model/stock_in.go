package model

import "time"

type StockIn struct {
	ID        uint
	Owner     User
	Items     []StockInItem
	CreatedAt time.Time
	UpdatedAt time.Time
}

type StockInItem struct {
	ID            uint
	StockInID     uint
	ItemPackaging ItemPackaging
	BuyPrice      float64
	Quantity      int
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
