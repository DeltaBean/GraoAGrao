// model/stock_in.go
package model

import "time"

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
