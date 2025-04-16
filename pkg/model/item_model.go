package model

import "time"

type Item struct {
	ID          uint     `json:"item_id"`
	Description string   `json:"item_description" binding:"required"`
	EAN13       string   `json:"ean13" binding:"required,len=13"`
	Category    Category `json:"category" binding:"required"`

	Owner User `json:"owner"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Category struct {
	ID          uint   `json:"id"`
	Description string `json:"description" binding:"required"`

	Owner User `json:"owner"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
