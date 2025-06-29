package model

import "time"

type ItemPackaging struct {
	ID              uint
	Item            Item
	Description     string
	Quantity        float32
	EAN8            string
	LabelPDFURL     string
	LabelPreviewURL string

	CreatedBy User
	Store     Store

	CreatedAt time.Time
	UpdatedAt time.Time
}
