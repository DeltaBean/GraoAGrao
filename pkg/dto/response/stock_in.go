package response

import "time"

type StockInResponse struct {
	ID        uint                  `json:"id"`
	Items     []StockInItemResponse `json:"items"`
	CreatedAt time.Time             `json:"created_at"`
	UpdatedAt time.Time             `json:"updated_at"`
}

type StockInItemResponse struct {
	ID                    uint    `json:"id"`
	ItemPackagingID       uint    `json:"item_packaging_id"`
	ItemPackagingDesc     string  `json:"item_packaging_description"`
	ItemPackagingItemDesc string  `json:"item_packaging_item_description"`
	ItemPackagingUnit     string  `json:"item_packaging_unit"`
	BuyPrice              float64 `json:"buy_price"`
	Quantity              int     `json:"quantity"`
}
