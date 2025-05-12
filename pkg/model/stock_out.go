package model

import "time"

type StockOut struct {
	ID          uint
	CreatedBy   User
	Items       []StockOutItem
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	FinalizedAt *time.Time
}

type StockOutItem struct {
	ID            uint
	StockOutID    uint
	Item          Item
	TotalQuantity float64
	Packagings    []StockOutPackaging
}

type StockOutPackaging struct {
	ID             uint
	StockOutItemID uint
	ItemPackaging  ItemPackaging
	Quantity       int
}
