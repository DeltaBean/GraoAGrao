package model

import "time"

type StockOut struct {
	ID        uint
	CreatedAt time.Time
	UpdatedAt time.Time
	Owner     User
	Items     []StockOutItem
}

type StockOutItem struct {
	ID         uint
	StockOutID uint
	Item       Item
	Quantity   int
}
