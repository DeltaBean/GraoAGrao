package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateStockWasteRequest struct {
	ItemID         uint    `json:"item_id" binding:"required"`
	WastedQuantity float64 `json:"wasted_quantity" binding:"required,gt=0"`
	ReasonText     string  `json:"reason_text" binding:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateStockWasteRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateStockWasteRequest struct {
	StockWasteID   uint    `json:"stock_waste_id" binding:"required"`
	ItemID         uint    `json:"item_id" binding:"required"`
	WastedQuantity float64 `json:"wasted_quantity" binding:"required,gt=0"`
	ReasonText     string  `json:"reason_text" binding:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateStockWasteRequest) Validate() error {
	return validator.Validate.Struct(r)
}
