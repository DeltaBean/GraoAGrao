package go_migrations

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/google/uuid"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_packaging_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/migrations/register"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/item_packaging_service"
	"github.com/jackc/pgx/v5"
)

func init() {
	register.Register("00029.go", run00029)
}

func run00029(ctx context.Context, tx pgx.Tx, schema string) error {
	// Define o search_path para o schema do tenant
	_, err := tx.Exec(ctx, fmt.Sprintf(`SET LOCAL search_path TO "%s", public;`, schema))
	if err != nil {
		logger.Log.Error(err)
		return fmt.Errorf("failed to set search_path for schema %s: %w", schema, err)
	}

	// Lista os item_packagings
	packagings, err := item_packaging_repository.ListAllItemPackagingsWithTransaction(tx)
	if err != nil {
		return fmt.Errorf("failed to list item_packagings: %w", err)
	}

	logger.Log.Infof("[00029] 🔍 Checking %d item_packagings in schema %s", len(packagings), schema)
	for _, packaging := range packagings {
		// Se faltar EAN8 ou a URL da etiqueta, gerar e subir
		if packaging.EAN8 == "" || packaging.LabelPDFURL == "" || packaging.LabelPreviewURL == "" {

			// Gerando EAN8
			uuid := uuid.New().String()
			ean8, err := util.GenerateEAN8(packaging, uuid)
			if err != nil {
				logger.Log.Error(err)
				return fmt.Errorf("failed to generate EAN8 for packaging %d: %w", packaging.ID, err)
			}
			packaging.EAN8 = ean8

			// Gerando PDF
			pdfBytes, err := item_packaging_service.GenerateLabelPDF(&packaging, &packaging.Store)
			if err != nil {
				logger.Log.Error(err)
				return fmt.Errorf("failed to generate label pdf for packaging %d: %w", packaging.ID, err)
			}
			pdfFileName := fmt.Sprintf("label-%s.pdf", packaging.EAN8)

			// Gerando preview PNG
			previewBytes, err := item_packaging_service.GenerateLabelPreviewPNG(pdfBytes)
			if err != nil {
				logger.Log.Error(err)
				return fmt.Errorf("failed to generate label preview for packaging %d: %w", packaging.ID, err)
			}
			previewFileName := fmt.Sprintf("preview-label-%s.png", packaging.EAN8)

			// Realizando upload do pdf para o R2
			pdfURL, err := util.UploadToR2(pdfBytes, pdfFileName, false)
			if err != nil {
				logger.Log.Error(err)
				return fmt.Errorf("failed to upload label pdf for packaging %d: %w", packaging.ID, err)
			}
			packaging.LabelPDFURL = pdfURL

			// Realizando upload do preview para o R2
			pngURL, err := util.UploadToR2(previewBytes, previewFileName, false)
			if err != nil {
				logger.Log.Error(err)
				return fmt.Errorf("failed to upload label preview for packaging %d: %w", packaging.ID, err)
			}
			packaging.LabelPreviewURL = pngURL

			updateItemPackagingLabel(ctx, tx, packaging)
		}
	}

	return nil
}

func updateItemPackagingLabel(ctx context.Context, tx pgx.Tx, packaging model.ItemPackaging) error {
	_, err := tx.Exec(ctx, `
		UPDATE tb_item_packaging
		SET 
			ean_8 = $1,
			label_pdf_url = $2,
			label_preview_url = $3,
			updated_at = now()
		WHERE item_packaging_id = $4
	`, packaging.EAN8, packaging.LabelPDFURL, packaging.LabelPreviewURL, packaging.ID)

	if err != nil {
		logger.Log.Errorf("Failed to update packaging %d: %v", packaging.ID, err)
		return err
	}
	return nil
}
