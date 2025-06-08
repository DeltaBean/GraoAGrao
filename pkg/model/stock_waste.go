package model

import "time"

type StockWaste struct {
	StockWasteID   uint
	Item           Item
	WastedQuantity float64
	ReasonText     string
	ReasonImageURL *string // nullable
	CreatedBy      User
	CreatedAt      time.Time
}
