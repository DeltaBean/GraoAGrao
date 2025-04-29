package response

import "time"

type StockInResponse struct {
	ID        uint                  `json:"id"`
	Items     []StockInItemResponse `json:"items"`
	CreatedAt time.Time             `json:"created_at"`
	UpdatedAt time.Time             `json:"updated_at"`
}

type StockInItemResponse struct {
	ID                    uint                  `json:"id"`
	ItemPackagingResponse ItemPackagingResponse `json:"item_packaging"`
	ItemResponse          ItemResponse          `json:"item"`
	BuyPrice              float64               `json:"buy_price"`
	Quantity              int                   `json:"quantity"`
}
