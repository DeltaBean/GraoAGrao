// model/stock_in.go
package model

import "time"

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
