package response

import "time"

type StockInResponse struct {
	ID        uint                  `json:"id"`
	Items     []StockInItemResponse `json:"items"`
	Status    string                `json:"status"`
	CreatedAt time.Time             `json:"created_at"`
	UpdatedAt time.Time             `json:"updated_at"`
}

type StockInItemResponse struct {
	ID            uint                       `json:"id"`
	Item          ItemResponse               `json:"item"`
	BuyPrice      float64                    `json:"buy_price"`
	TotalQuantity float64                    `json:"total_quantity"`
	Packagings    []StockInPackagingResponse `json:"packagings"`
}

type StockInPackagingResponse struct {
	ID            uint                  `json:"id"`
	ItemPackaging ItemPackagingResponse `json:"item_packaging"`
	Quantity      int                   `json:"quantity"`
}
