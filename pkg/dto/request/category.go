package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateCategoryRequest struct {
	Description string `json:"description" validate:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *CreateCategoryRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateCategoryRequest struct {
	ID          uint   `json:"id" validate:"required"`
	Description string `json:"description" validate:"required"`
}

// Validate runs Go-Playground on the struct tags.
func (r *UpdateCategoryRequest) Validate() error {
	return validator.Validate.Struct(r)
}
