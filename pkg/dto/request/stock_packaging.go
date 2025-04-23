package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateStockPackagingRequest struct {
	ItemID      uint    `json:"item_id" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Quantity    float32 `json:"quantity" validate:"required,gt=0"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateStockPackagingRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateStockPackagingRequest struct {
	ID          uint    `json:"id" validate:"required"`
	ItemID      uint    `json:"item_id" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Quantity    float32 `json:"quantity" validate:"required,gt=0"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateStockPackagingRequest) Validate() error {
	return validator.Validate.Struct(r)
}
