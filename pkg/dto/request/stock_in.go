package request

type CreateStockInRequest struct {
	Items []CreateStockInItemRequest `json:"items" validate:"required,dive"`
}

type CreateStockInItemRequest struct {
	ItemID        uint                            `json:"item_id" validate:"required"`
	BuyPrice      float64                         `json:"buy_price" validate:"required,gt=0"`
	TotalQuantity float64                         `json:"total_quantity" validate:"required,gt=0"`
	Packagings    []CreateStockInPackagingRequest `json:"packagings" validate:"required,dive"`
}

type CreateStockInPackagingRequest struct {
	ItemPackagingID uint `json:"item_packaging_id" validate:"required"`
	Quantity        int  `json:"quantity" validate:"required,gt=0"`
}

type UpdateStockInRequest struct {
	ID    uint                       `json:"id" validate:"required"`
	Items []UpdateStockInItemRequest `json:"items" validate:"required,dive"`
}

type UpdateStockInItemRequest struct {
	ID            *uint                           `json:"id,omitempty"`
	ItemID        uint                            `json:"item_id" validate:"required"`
	BuyPrice      float64                         `json:"buy_price" validate:"required,gt=0"`
	TotalQuantity float64                         `json:"total_quantity" validate:"required,gt=0"`
	Packagings    []UpdateStockInPackagingRequest `json:"packagings" validate:"required,dive"`
}

type UpdateStockInPackagingRequest struct {
	ID              *uint `json:"id,omitempty"`
	ItemPackagingID uint  `json:"item_packaging_id" validate:"required"`
	Quantity        int   `json:"quantity" validate:"required,gt=0"`
}
