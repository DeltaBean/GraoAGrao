package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateStockOutRequest struct {
	Items []CreateStockOutItemRequest `json:"items" validate:"required,dive"`
}

type CreateStockOutItemRequest struct {
	ItemID        uint                             `json:"item_id" validate:"required"`
	TotalQuantity float64                          `json:"total_quantity" validate:"required,gt=0"`
	Packagings    []CreateStockOutPackagingRequest `json:"packagings" validate:"required,dive"`
}

type CreateStockOutPackagingRequest struct {
	ItemPackagingID uint `json:"item_packaging_id" validate:"required"`
	Quantity        int  `json:"quantity" validate:"required,gt=0"`
}

func (r *CreateStockOutRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateStockOutRequest struct {
	ID    uint                        `json:"id" validate:"required"`
	Items []UpdateStockOutItemRequest `json:"items" validate:"required,dive"`
}

type UpdateStockOutItemRequest struct {
	ID            *uint                            `json:"id,omitempty"`
	ItemID        uint                             `json:"item_id" validate:"required"`
	TotalQuantity float64                          `json:"total_quantity" validate:"required,gt=0"`
	Packagings    []UpdateStockOutPackagingRequest `json:"packagings" validate:"required,dive"`
}

type UpdateStockOutPackagingRequest struct {
	ID              *uint `json:"id,omitempty"`
	ItemPackagingID uint  `json:"item_packaging_id" validate:"required"`
	Quantity        int   `json:"quantity" validate:"required,gt=0"`
}

func (r *UpdateStockOutRequest) Validate() error {
	return validator.Validate.Struct(r)
}
