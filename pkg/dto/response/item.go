// internal/dto/response/item.go
package response

import "time"

// ItemResponse is what we send back to the client.
type ItemResponse struct {
	ID            uint                  `json:"id"`
	Description   string                `json:"description"`
	EAN13         string                `json:"ean13"`
	Category      CategoryResponse      `json:"category"`
	UnitOfMeasure UnitOfMeasureResponse `json:"unit_of_measure"`
	CreatedAt     time.Time             `json:"created_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
}
