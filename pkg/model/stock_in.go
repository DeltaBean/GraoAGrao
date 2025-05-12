package model

import "time"

type StockIn struct {
	ID          uint
	CreatedBy   User
	Items       []StockInItem
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	FinalizedAt *time.Time
}

type StockInItem struct {
	ID            uint
	StockInID     uint
	Item          Item
	BuyPrice      float64
	TotalQuantity float64
	Packagings    []StockInPackaging
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type StockInPackaging struct {
	ID            uint
	StockInItemID uint
	ItemPackaging ItemPackaging
	Quantity      int
}
