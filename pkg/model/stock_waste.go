package model

import "time"

type StockWaste struct {
	StockWasteID   uint
	Item           Item
	WastedQuantity float64
	Status         string
	ReasonText     string
	ReasonImageURL *string // nullable
	CreatedBy      User
	CreatedAt      time.Time
	FinalizedAt    *time.Time // nullable, used for finalization timestamp
}
