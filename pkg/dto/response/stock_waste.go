package response

import "time"

type StockWasteResponse struct {
	StockWasteID   uint         `json:"stock_waste_id"`
	Item           ItemResponse `json:"item"`
	WastedQuantity float64      `json:"wasted_quantity"`
	Status         string       `json:"status"`
	ReasonText     string       `json:"reason_text"`
	ReasonImageURL *string      `json:"reason_image_url,omitempty"`
	CreatedAt      time.Time    `json:"created_at"`
	FinalizedAt    time.Time    `json:"finalized_at"`
}
