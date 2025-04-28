package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateItemPackagingRequest struct {
	ItemID      uint    `json:"item_id" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Quantity    float32 `json:"quantity" validate:"required,gt=0"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateItemPackagingRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateItemPackagingRequest struct {
	ID          uint    `json:"id" validate:"required"`
	ItemID      uint    `json:"item_id" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Quantity    float32 `json:"quantity" validate:"required,gt=0"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateItemPackagingRequest) Validate() error {
	return validator.Validate.Struct(r)
}
