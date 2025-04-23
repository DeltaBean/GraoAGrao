package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateUnitOfMeasureRequest struct {
	Description string `json:"description" validate:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateUnitOfMeasureRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateUnitOfMeasureRequest struct {
	ID          uint   `json:"id" validate:"required"`
	Description string `json:"description" validate:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateUnitOfMeasureRequest) Validate() error {
	return validator.Validate.Struct(r)
}
