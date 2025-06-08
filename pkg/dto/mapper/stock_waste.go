package mapper

import (
	"time"

	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// CreateStockWasteToModel maps a create request to a StockWaste domain model.
func CreateStockWasteToModel(req *request.CreateStockWasteRequest, userID uint) *model.StockWaste {
	return &model.StockWaste{
		Item: model.Item{
			ID: req.ItemID,
		},
		WastedQuantity: req.WastedQuantity,
		ReasonText:     req.ReasonText,
		CreatedBy: model.User{
			ID: userID,
		},
		CreatedAt: time.Now(), // or use db default
	}
}

// UpdateStockWasteToModel maps an update request to a StockWaste domain model.
func UpdateStockWasteToModel(req *request.UpdateStockWasteRequest, userID uint) *model.StockWaste {
	return &model.StockWaste{
		StockWasteID:   req.StockWasteID,
		Item:           model.Item{ID: req.ItemID},
		WastedQuantity: req.WastedQuantity,
		ReasonText:     req.ReasonText,
		CreatedBy:      model.User{ID: userID},
	}
}

// ToStockWasteResponse maps a StockWaste domain model to a response DTO.
func ToStockWasteResponse(m *model.StockWaste) response.StockWasteResponse {
	return response.StockWasteResponse{
		StockWasteID:   m.StockWasteID,
		Item:           ToItemResponse(&m.Item),
		WastedQuantity: m.WastedQuantity,
		ReasonText:     m.ReasonText,
		ReasonImageURL: m.ReasonImageURL,
		CreatedAt:      m.CreatedAt,
	}
}
