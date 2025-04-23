package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateCategoryToModel(req *request.CreateCategoryRequest, ownerID uint) *model.Category {
	return &model.Category{
		Description: req.Description,
		Owner:       model.User{ID: ownerID},
	}
}

func UpdateCategoryToModel(req *request.UpdateCategoryRequest, ownerID uint) *model.Category {
	return &model.Category{
		ID:          req.ID,
		Description: req.Description,
		Owner:       model.User{ID: ownerID},
	}
}

func ToCategoryResponse(m *model.Category) *response.CategoryResponse {
	return &response.CategoryResponse{
		ID:          m.ID,
		Description: m.Description,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
