package item_packaging_service

import (
	"fmt"
	"os"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/google/uuid"
	"github.com/pdfcpu/pdfcpu/pkg/api"
	pdfcpuModel "github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"

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

func GenerateBatchLabelPDF(conn *pgxpool.Conn, batch []request.LabelBatchRequest) ([]byte, error) {
	// Create a temporary directory for intermediate files
	tmpDir, err := os.MkdirTemp("", "label-batch")
	if err != nil {
		logger.Log.Error(err)
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	// Store all merged label file paths
	var allLabelPaths []string

	for _, entry := range batch {
		if entry.Quantity <= 0 {
			continue
		}

		// Step 1: Get label URL from DB
		url, err := item_packaging_repository.GetLabelPDFURLByID(conn, entry.ItemPackagingID)
		if err != nil {
			logger.Log.Error(err)
			return nil, fmt.Errorf("get label URL for ID %d: %w", entry.ItemPackagingID, err)
		}

		// Step 2: Download from Cloudflare R2
		pdfBytes, err := util.DownloadPrivateR2ObjectByURL(url)
		if err != nil {
			logger.Log.Error(err)
			return nil, fmt.Errorf("download label PDF for ID %d: %w", entry.ItemPackagingID, err)
		}

		// Step 3: Write `quantity` copies to disk
		for i := 0; i < int(entry.Quantity); i++ {
			tmpFile, err := os.CreateTemp(tmpDir, fmt.Sprintf("label_%d_*.pdf", entry.ItemPackagingID))
			if err != nil {
				logger.Log.Error(err)
				return nil, fmt.Errorf("create tmp file for ID %d: %w", entry.ItemPackagingID, err)
			}
			if _, err := tmpFile.Write(pdfBytes); err != nil {
				logger.Log.Error(err)
				return nil, fmt.Errorf("write label PDF to tmp for ID %d: %w", entry.ItemPackagingID, err)
			}
			tmpFile.Close()

			allLabelPaths = append(allLabelPaths, tmpFile.Name())
		}
	}

	// Step 4: Merge all PDFs into one using pdfcpu
	finalFile, err := os.CreateTemp(tmpDir, "final_*.pdf")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp output file: %w", err)
	}
	outputPath := finalFile.Name()
	finalFile.Close()

	err = api.MergeCreateFile(allLabelPaths, outputPath, false, pdfcpuModel.NewDefaultConfiguration())
	if err != nil {
		return nil, fmt.Errorf("failed to merge PDFs: %w", err)
	}

	// Step 5: Load final PDF into memory
	finalPDF, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, fmt.Errorf("read merged PDF: %w", err)
	}

	return finalPDF, nil
}
