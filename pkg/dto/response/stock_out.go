package response

import "time"

type StockOutResponse struct {
	ID          uint                   `json:"id"`
	Items       []StockOutItemResponse `json:"items"`
	Status      string                 `json:"status"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	FinalizedAt time.Time              `json:"finalized_at"`
}

type StockOutItemResponse struct {
	ID            uint                        `json:"id"`
	Item          ItemResponse                `json:"item"`
	TotalQuantity float64                     `json:"total_quantity"`
	Packagings    []StockOutPackagingResponse `json:"packagings"`
}

type StockOutPackagingResponse struct {
	ID            uint                  `json:"id"`
	ItemPackaging ItemPackagingResponse `json:"item_packaging"`
	Quantity      int                   `json:"quantity"`
}
