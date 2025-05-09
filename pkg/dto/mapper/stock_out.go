package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/util"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func CreateStockOutToModel(r *request.CreateStockOutRequest) *model.StockOut {
	var items []model.StockOutItem

	for _, itr := range r.Items {
		var packagings []model.StockOutPackaging
		for _, p := range itr.Packagings {
			packagings = append(packagings, model.StockOutPackaging{
				ItemPackaging: model.ItemPackaging{ID: p.ItemPackagingID},
				Quantity:      p.Quantity,
			})
		}

		stockOutItem := model.StockOutItem{
			Item:          model.Item{ID: itr.ItemID},
			TotalQuantity: itr.TotalQuantity,
			Packagings:    packagings,
		}

		items = append(items, stockOutItem)
	}

	return &model.StockOut{
		Items: items,
	}
}

func UpdateStockOutToModel(r *request.UpdateStockOutRequest) *model.StockOut {
	var items []model.StockOutItem

	for _, itr := range r.Items {
		var packagings []model.StockOutPackaging
		for _, p := range itr.Packagings {
			packagings = append(packagings, model.StockOutPackaging{
				ID:            getID(p.ID),
				ItemPackaging: model.ItemPackaging{ID: p.ItemPackagingID},
				Quantity:      p.Quantity,
			})
		}

		stockOutItem := model.StockOutItem{
			ID:            getID(itr.ID),
			StockOutID:    r.ID,
			Item:          model.Item{ID: itr.ItemID},
			TotalQuantity: itr.TotalQuantity,
			Packagings:    packagings,
		}

		items = append(items, stockOutItem)
	}

	return &model.StockOut{
		ID:    r.ID,
		Items: items,
	}
}

func ToStockOutResponse(m *model.StockOut) *response.StockOutResponse {
	var items []response.StockOutItemResponse

	for _, i := range m.Items {
		var packagings []response.StockOutPackagingResponse
		for _, p := range i.Packagings {
			packagings = append(packagings, response.StockOutPackagingResponse{
				ID:            p.ID,
				ItemPackaging: ToItemPackagingResponse(&p.ItemPackaging),
				Quantity:      p.Quantity,
			})
		}

		items = append(items, response.StockOutItemResponse{
			ID:            i.ID,
			Item:          ToItemResponse(&i.Item),
			TotalQuantity: i.TotalQuantity,
			Packagings:    packagings,
		})
	}

	return &response.StockOutResponse{
		ID:          m.ID,
		Status:      m.Status,
		Items:       items,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		FinalizedAt: util.SafeTime(m.FinalizedAt),
	}
}
