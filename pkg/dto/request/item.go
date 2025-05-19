// pkg/dto/request/item.go
package request

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/validator"
)

// CreateItemRequest is used when POSTing a new Item.
type CreateItemRequest struct {
	Description     string `json:"description"      validate:"required"`
	EAN13           string `json:"ean13"            validate:"required,len=13,numeric"`
	CategoryID      uint   `json:"category_id"      validate:"required"`
	UnitOfMeasureID uint   `json:"unit_of_measure_id" validate:"required"`
	IsFractionable  bool   `json:"is_fractionable"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateItemRequest) Validate() error {
	return validator.Validate.Struct(r)
}

// UpdateItemRequest is used when PUT/PATCHing an existing Item.
type UpdateItemRequest struct {
	ID              uint   `json:"id" validate:"required"`
	Description     string `json:"description"      validate:"required"`
	EAN13           string `json:"ean13"            validate:"required,len=13,numeric"`
	CategoryID      uint   `json:"category_id"      validate:"required"`
	UnitOfMeasureID uint   `json:"unit_of_measure_id" validate:"required"`
	IsFractionable  bool   `json:"is_fractionable"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateItemRequest) Validate() error {
	return validator.Validate.Struct(r)
}
