package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateStockInToModel(r *request.CreateStockInRequest) *model.StockIn {

	var items []model.StockInItem

	for _, itr := range r.Items {
		stockInItem := model.StockInItem{
			Item:          model.Item{ID: itr.ItemID},
			ItemPackaging: model.ItemPackaging{ID: itr.ItemPackagingID},
			BuyPrice:      itr.BuyPrice,
			Quantity:      itr.Quantity,
		}

		items = append(items, stockInItem)
	}

	return &model.StockIn{
		Items: items,
	}
}

func UpdateStockInToModel(r *request.UpdateStockInRequest) *model.StockIn {
	var items []model.StockInItem

	for _, itr := range r.Items {
		stockInItem := model.StockInItem{
			ID:            *itr.ID,
			StockInID:     r.ID,
			ItemPackaging: model.ItemPackaging{ID: itr.ItemPackagingID},
			Item:          model.Item{ID: itr.ItemID},
			BuyPrice:      itr.BuyPrice,
			Quantity:      itr.Quantity,
		}

		items = append(items, stockInItem)
	}

	return &model.StockIn{
		ID:    r.ID,
		Items: items,
	}
}

func ToStockInResponse(m *model.StockIn) *response.StockInResponse {
	var items []response.StockInItemResponse

	for _, itr := range m.Items {
		stockInItem := response.StockInItemResponse{
			ID:                    itr.ID,
			ItemPackagingResponse: ToItemPackagingResponse(&itr.ItemPackaging),
			ItemResponse:          ToItemResponse(&itr.Item),
			BuyPrice:              itr.BuyPrice,
			Quantity:              itr.Quantity,
		}

		items = append(items, stockInItem)
	}

	return &response.StockInResponse{
		ID:        m.ID,
		Items:     items,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
