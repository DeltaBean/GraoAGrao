package mapper

import (
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

// ToStockResponse maps a Stock model to StockResponse DTO.
func ToStockResponse(m *model.Stock) *response.StockResponse {
	if m == nil {
		return nil
	}
	return &response.StockResponse{
		ID:           m.ID,
		Item:         ToItemResponse(&m.Item),
		CurrentStock: m.CurrentStock,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}
