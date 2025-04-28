package request

type CreateStockInRequest struct {
	Items []CreateStockInItemRequest `json:"items" validate:"required,dive,gt=0"`
}

type CreateStockInItemRequest struct {
	ItemPackagingID uint    `json:"item_packaging_id" validate:"required"`
	BuyPrice        float64 `json:"buy_price" validate:"required,gt=0"`
	Quantity        int     `json:"quantity" validate:"required,gt=0"`
}

type UpdateStockInRequest struct {
	ID    uint                       `json:"id" validate:"required"`
	Items []UpdateStockInItemRequest `json:"items" validate:"required,dive"`
}

type UpdateStockInItemRequest struct {
	ID              *uint   `json:"id,omitempty"` // pointer to allow nil (new items)
	ItemPackagingID uint    `json:"item_packaging_id" validate:"required"`
	BuyPrice        float64 `json:"buy_price" validate:"required,gt=0"`
	Quantity        int     `json:"quantity" validate:"required,gt=0"`
}
