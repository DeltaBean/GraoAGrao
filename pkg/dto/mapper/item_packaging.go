package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateItemPackagingToModel(r *request.CreateItemPackagingRequest, OwnerID, StoreID uint) *model.ItemPackaging {
	return &model.ItemPackaging{
		Description: r.Description,
		Quantity:    r.Quantity,
		Item:        model.Item{ID: r.ItemID},
		CreatedBy:   model.User{ID: OwnerID},
		Store:       model.Store{ID: StoreID},
	}
}

func UpdateItemPackagingToModel(r *request.UpdateItemPackagingRequest) *model.ItemPackaging {
	return &model.ItemPackaging{
		ID:          r.ID,
		Description: r.Description,
		Quantity:    r.Quantity,
		Item:        model.Item{ID: r.ItemID},
	}
}

func ToItemPackagingResponse(m *model.ItemPackaging) response.ItemPackagingResponse {
	return response.ItemPackagingResponse{
		ID:              m.ID,
		Description:     m.Description,
		Quantity:        m.Quantity,
		EAN8:            m.EAN8,
		LabelPDFURL:     m.LabelPDFURL,
		LabelPreviewURL: m.LabelPreviewURL,
		Item: response.ItemResponse{ID: m.Item.ID,
			Description: m.Item.Description,
			UnitOfMeasure: response.UnitOfMeasureResponse{
				ID:          m.Item.UnitOfMeasure.ID,
				Description: m.Item.UnitOfMeasure.Description,
			},
			Category: response.CategoryResponse{
				ID:          m.Item.Category.ID,
				Description: m.Item.Category.Description,
			},
		},
	}
}
