package request

import "github.com/IlfGauhnith/GraoAGrao/pkg/validator"

type CreateStoreRequest struct {
	Name string `json:"name" validate:"required"`
}

func (r *CreateStoreRequest) Validate() error {
	return validator.Validate.Struct(r)
}

type UpdateStoreRequest struct {
	ID   uint   `json:"store_id" validate:"required"`
	Name string `json:"name"     validate:"required"`
}

func (r *UpdateStoreRequest) Validate() error {
	return validator.Validate.Struct(r)
}
