package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// ToItemModel converts CreateItemRequest → your domain model.
func CreateItemToModel(req *request.CreateItemRequest, ownerID uint) *model.Item {
	return &model.Item{
		Description:   req.Description,
		EAN13:         req.EAN13,
		Category:      model.Category{ID: req.CategoryID},
		UnitOfMeasure: model.UnitOfMeasure{ID: req.UnitOfMeasureID},
		Owner:         model.User{ID: ownerID},
	}
}

func UpdateItemToModel(req *request.UpdateItemRequest, ownerID uint) *model.Item {
	return &model.Item{
		ID:            req.ID,
		Description:   req.Description,
		EAN13:         req.EAN13,
		Category:      model.Category{ID: req.CategoryID},
		UnitOfMeasure: model.UnitOfMeasure{ID: req.UnitOfMeasureID},
		Owner:         model.User{ID: ownerID},
	}
}

// ToItemResponse converts domain model → ItemResponse.
func ToItemResponse(m *model.Item) response.ItemResponse {
	return response.ItemResponse{
		ID:          m.ID,
		Description: m.Description,
		EAN13:       m.EAN13,
		Category: response.CategoryResponse{
			ID:          m.Category.ID,
			Description: m.Category.Description,
		},
		UnitOfMeasure: response.UnitOfMeasureResponse{
			ID:          m.UnitOfMeasure.ID,
			Description: m.UnitOfMeasure.Description,
		},
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
