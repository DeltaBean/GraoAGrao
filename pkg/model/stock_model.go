package model

import "time"

type Stock struct {
	ID           uint      `json:"id"`
	Item         Item      `json:"item"`
	Owner        User      `json:"owner"`
	CurrentStock int       `json:"current_stock"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type StockIn struct {
	ID        uint          `json:"id"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
	Owner     User          `json:"owner"`
	Items     []StockInItem `json:"items" binding:"required"`
}

type StockInItem struct {
	ID        uint    `json:"id"`
	StockInID uint    `json:"stock_in_id"`
	Item      Item    `json:"item" binding:"required"`
	BuyPrice  float64 `json:"buy_price" binding:"required,gt=0"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
}

type StockOut struct {
	ID        uint           `json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Owner     User           `json:"owner"`
	Items     []StockOutItem `json:"items" binding:"required"`
}

type StockOutItem struct {
	ID         uint `json:"id"`
	StockOutID uint `json:"stock_out_id"`
	Item       Item `json:"item" binding:"required"`
	Quantity   int  `json:"quantity" binding:"required,gt=0"`
}

type StockPackaging struct {
	ID          uint   `json:"id"`
	Item        Item   `json:"item" binding:"required"`
	Description string `json:"description" binding:"required"`
	Quantity    int    `json:"quantity" binding:"required,gt=0"`

	Owner User `json:"owner"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
