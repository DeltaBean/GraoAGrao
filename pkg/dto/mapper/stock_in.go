package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateStockInToModel(r *request.CreateStockInRequest) *model.StockIn {
	var items []model.StockInItem

	for _, itr := range r.Items {
		var packagings []model.StockInPackaging
		for _, p := range itr.Packagings {
			packagings = append(packagings, model.StockInPackaging{
				ItemPackaging: model.ItemPackaging{ID: p.ItemPackagingID},
				Quantity:      p.Quantity,
			})
		}

		stockInItem := model.StockInItem{
			Item:          model.Item{ID: itr.ItemID},
			BuyPrice:      itr.BuyPrice,
			TotalQuantity: itr.TotalQuantity,
			Packagings:    packagings,
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
		var packagings []model.StockInPackaging
		for _, p := range itr.Packagings {
			packagings = append(packagings, model.StockInPackaging{
				ID:            getID(p.ID),
				ItemPackaging: model.ItemPackaging{ID: p.ItemPackagingID},
				Quantity:      p.Quantity,
			})
		}

		stockInItem := model.StockInItem{
			ID:            getID(itr.ID),
			StockInID:     r.ID,
			Item:          model.Item{ID: itr.ItemID},
			BuyPrice:      itr.BuyPrice,
			TotalQuantity: itr.TotalQuantity,
			Packagings:    packagings,
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

	for _, i := range m.Items {
		var packagings []response.StockInPackagingResponse
		for _, p := range i.Packagings {
			packagings = append(packagings, response.StockInPackagingResponse{
				ID:            p.ID,
				ItemPackaging: ToItemPackagingResponse(&p.ItemPackaging),
				Quantity:      p.Quantity,
			})
		}

		items = append(items, response.StockInItemResponse{
			ID:            i.ID,
			Item:          ToItemResponse(&i.Item),
			BuyPrice:      i.BuyPrice,
			TotalQuantity: i.TotalQuantity,
			Packagings:    packagings,
		})
	}

	return &response.StockInResponse{
		ID:        m.ID,
		Status:    m.Status,
		Items:     items,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}

func getID(id *uint) uint {
	if id != nil {
		return *id
	}
	return 0
}
