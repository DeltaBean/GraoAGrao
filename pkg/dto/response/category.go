package response

import "time"

// CategoryResponse hides internal fields and shows only what clients need.
type CategoryResponse struct {
	ID          uint      `json:"id"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
