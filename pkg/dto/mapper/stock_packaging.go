package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateStockPackagingToModel(r request.CreateStockPackagingRequest) model.StockPackaging {
	return model.StockPackaging{
		Description: r.Description,
		Quantity:    r.Quantity,
		Item:        model.Item{ID: r.ItemID},
	}
}

func UpdateStockPackagingToModel(r request.UpdateStockPackagingRequest) model.StockPackaging {
	return model.StockPackaging{
		ID:          r.ID,
		Description: r.Description,
		Quantity:    r.Quantity,
		Item:        model.Item{ID: r.ItemID},
	}
}

func ToStockPackagingResponse(m model.StockPackaging) response.StockPackagingResponse {
	return response.StockPackagingResponse{
		ID:          m.ID,
		Description: m.Description,
		Quantity:    m.Quantity,
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
