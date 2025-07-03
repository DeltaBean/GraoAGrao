package item_packaging_service

import (
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/google/uuid"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_packaging_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/store_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateItemPackaging(conn *pgxpool.Conn, packaging *model.ItemPackaging, storeID uint) error {
	// 1) Generate EAN8
	uuid := uuid.New().String()
	ean8, err := util.GenerateEAN8(*packaging, uuid)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to generate EAN-8: %w", err)
	}
	packaging.EAN8 = ean8

	// 2) Retrive Item Packaging Item data
	item, err := item_repository.GetItemByID(conn, packaging.Item.ID)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("error retrieving Item Packaging Item")
	}
	packaging.Item = *item

	// 3) Retrive Store data
	store, err := store_repository.GetStoreByID(conn, storeID)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("error retrieving Item Packaging Store")
	}

	// 4) Generate label PDF
	pdfBytes, err := GenerateLabelPDF(packaging, store)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to generate pdf: %w", err)
	}
	pdfFileName := fmt.Sprintf("label-%s.pdf", packaging.EAN8)

	// 5) Generate label preview PNG
	previewBytes, err := GenerateLabelPreviewPNG(pdfBytes)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to generate preview png: %w", err)
	}
	previewFileName := fmt.Sprintf("preview-label-%s.png", packaging.EAN8)

	// 6) Save label PDF on R2 and retrieve URL
	pdfURL, err := util.UploadToR2(pdfBytes, pdfFileName, false)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to save PDF on R2: %w", err)
	}
	packaging.LabelPDFURL = pdfURL

	// 7) Save label preview on R2 and retrieve URL
	pngURL, err := util.UploadToR2(previewBytes, previewFileName, false)
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to save preview on R2: %w", err)
	}
	packaging.LabelPreviewURL = pngURL

	// 8) Save on repo and return any error
	return item_packaging_repository.SaveItemPackaging(conn, packaging)
}

func GetLabelPreviewByID(conn *pgxpool.Conn, id uint) (string, error) {
	logger.Log.Infof("GetLabelPreviewByID: %d", id)

	url, err := item_packaging_repository.GetLabelPreviewByID(conn, uint(id))
	if err != nil {
		logger.Log.Error(err)
		return "", err
	}

	presigned, err := util.PresignPublicR2URL(url)
	if err != nil {
		logger.Log.Error(err)
		return "", err
	}

	return presigned, nil
}
