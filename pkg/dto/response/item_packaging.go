package response

type ItemPackagingResponse struct {
	ID              uint         `json:"id"`
	Description     string       `json:"description"`
	Quantity        float32      `json:"quantity"`
	Item            ItemResponse `json:"item"`
	EAN8            string       `json:"ean8"`
	LabelPDFURL     string       `json:"label_pdf_url"`
	LabelPreviewURL string       `json:"label_preview_url"`
}

type LabelPreviewResponse struct {
	URL string `json:"url"`
}
