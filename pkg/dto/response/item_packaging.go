package response

type ItemPackagingResponse struct {
	ID          uint         `json:"id"`
	Description string       `json:"description"`
	Quantity    float32      `json:"quantity"`
	Item        ItemResponse `json:"item"`
}
