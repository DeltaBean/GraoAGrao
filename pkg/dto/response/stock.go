package response

import "time"

// StockResponse represents the current stock position for an item.
type StockResponse struct {
	ID           uint         `json:"id"`
	Item         ItemResponse `json:"item"`
	CurrentStock int          `json:"current_stock"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
}
