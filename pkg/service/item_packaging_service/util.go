package item_packaging_service

import (
	"bytes"
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"os"
	"path/filepath"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/ean"
	"github.com/gen2brain/go-fitz"
	"github.com/pdfcpu/pdfcpu/pkg/api"

	"github.com/phpdave11/gofpdf"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	pdfcpuModel "github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

func GenerateLabelPDF(packaging *model.ItemPackaging, store *model.Store) ([]byte, error) {
	logger.Log.Info("GenerateLabelPDF")

	pdf := createLabelDocument()
	addLabelContent(pdf, packaging, store)

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		logger.Log.Error(err)
		return nil, err
	}

	return buf.Bytes(), nil
}

func createLabelDocument() *gofpdf.Fpdf {
	logger.Log.Info("createLabelDocument")

	pdf := gofpdf.NewCustom(&gofpdf.InitType{
		UnitStr: "mm",
		Size: gofpdf.SizeType{
			Wd: 50,
			Ht: 30,
		},
	})
	pdf.AddPage()
	pdf.SetFont("Arial", "", 8)
	pdf.SetAutoPageBreak(false, 0)
	return pdf
}

func addLabelContent(pdf *gofpdf.Fpdf, packaging *model.ItemPackaging, store *model.Store) {
	logger.Log.Info("addLabelContent")

	marginX := 1.0
	marginY := 1.0
	contentWidth := 48.0
	lineHeight := 3.2

	cursorX := marginX
	cursorY := marginY

	// Header
	pdf.SetFont("Arial", "B", 6)
	pdf.SetXY(cursorX, cursorY)
	pdf.CellFormat(contentWidth, lineHeight, store.Name, "", 0, "L", false, 0, "")
	cursorY += lineHeight

	// Divider
	pdf.Line(0, cursorY, 50, cursorY)
	cursorY += 1.0

	// Content Font
	pdf.SetFont("Arial", "", 8)

	// Item Description (MultiCell can wrap)
	pdf.SetXY(cursorX, cursorY)
	pdf.MultiCell(contentWidth, lineHeight, packaging.Item.Description, "", "L", false)
	cursorY = pdf.GetY()

	// Quantity
	pdf.SetXY(cursorX, cursorY)
	pdf.CellFormat(contentWidth, lineHeight, fmt.Sprintf("qtd.: %.2f %s", packaging.Quantity, packaging.Item.UnitOfMeasure.Description), "", 0, "L", false, 0, "")
	cursorY += lineHeight + 1.0 // add gap before barcode

	// Barcode image
	barcodeImg, err := generateEAN8Barcode(packaging.EAN8)
	if err != nil {
		logger.Log.Errorf("failed to generate EAN8 barcode: %v", err)
		return
	}

	imgOpts := gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: false}
	pdf.RegisterImageOptionsReader("barcode", imgOpts, barcodeImg)

	barcodeWidth := 30.0
	barcodeHeight := 10.0
	xPos := (50.0 - barcodeWidth) / 2.0
	yPos := 30.0 - barcodeHeight - 5.0 // leave room for text below

	pdf.ImageOptions("barcode", xPos, yPos, barcodeWidth, barcodeHeight, false, imgOpts, 0, "")

	// Draw EAN-8 text centered below barcode
	pdf.SetFont("Arial", "", 8)
	textWidth := pdf.GetStringWidth(packaging.EAN8)
	textX := (50.0 - textWidth) / 2.0
	textY := yPos + barcodeHeight + 1.0 // adjust as needed

	pdf.SetXY(textX, textY)
	ean8 := packaging.EAN8
	ean8Grouped := ean8[:4] + " " + ean8[4:]
	pdf.CellFormat(textWidth, 3.0, ean8Grouped, "", 0, "C", false, 0, "")
}

func generateEAN8Barcode(ean8 string) (*bytes.Reader, error) {
	if len(ean8) != 8 {
		return nil, fmt.Errorf("EAN-8 must be 8 digits, got: %s", ean8)
	}

	code, err := ean.Encode(ean8)
	if err != nil {
		return nil, err
	}

	// Scale the barcode
	scaled, err := barcode.Scale(code, 100, 30)
	if err != nil {
		return nil, err
	}

	// Convert to RGBA (8-bit per channel)
	rgba := image.NewRGBA(scaled.Bounds())
	draw.Draw(rgba, rgba.Bounds(), scaled, image.Point{}, draw.Src)

	var buf bytes.Buffer
	err = png.Encode(&buf, rgba)
	if err != nil {
		return nil, err
	}

	return bytes.NewReader(buf.Bytes()), nil
}

// GenerateLabelPreviewPNG renders the first page of a PDF (in []byte form) into a PNG image (also as []byte)
func GenerateLabelPreviewPNG(pdfData []byte) ([]byte, error) {
	doc, err := fitz.NewFromMemory(pdfData)
	if err != nil {
		logger.Log.Error(err)
		return nil, fmt.Errorf("failed to load PDF in memory: %w", err)
	}
	defer doc.Close()

	if doc.NumPage() == 0 {
		return nil, fmt.Errorf("no pages found in PDF")
	}

	// Render first page as image.Image
	img, err := doc.Image(0)
	if err != nil {
		logger.Log.Error(err)
		return nil, fmt.Errorf("failed to render page: %w", err)
	}

	var buf bytes.Buffer
	err = png.Encode(&buf, img)
	if err != nil {
		logger.Log.Error(err)
		return nil, fmt.Errorf("failed to encode PNG: %w", err)
	}

	return buf.Bytes(), nil
}

// AppendPDFMultipleTimes merges `srcPDF` into a final PDF `count` times.
// It uses temporary files to work around the lack of in-memory merge support in pdfcpu.
// Returns the merged PDF as a byte slice ([]byte).
func AppendPDFMultipleTimes(srcPDF []byte, count int) ([]byte, error) {
	// Create a temporary directory to hold intermediate PDF files.
	tmpDir, err := os.MkdirTemp("", "pdfmerge")
	if err != nil {
		return nil, fmt.Errorf("failed to create temporary directory: %w", err)
	}
	// Ensure the temp directory is cleaned up after execution.
	defer os.RemoveAll(tmpDir)

	// Slice to store the file paths of individual temporary copies of the PDF.
	var inputPaths []string

	// Write `count` copies of the input PDF to disk as separate temp files.
	for i := 0; i < count; i++ {
		tmpFile, err := os.CreateTemp(tmpDir, fmt.Sprintf("label_%d_*.pdf", i))
		if err != nil {
			return nil, fmt.Errorf("failed to create temporary input file: %w", err)
		}

		// Write the PDF content to the temporary file.
		if _, err := tmpFile.Write(srcPDF); err != nil {
			return nil, fmt.Errorf("failed to write to temporary PDF file: %w", err)
		}
		// Close the file to flush the write to disk.
		tmpFile.Close()

		// Add the path to the list for merging.
		inputPaths = append(inputPaths, tmpFile.Name())
	}

	// Define the output path for the merged PDF.
	outputPath := filepath.Join(tmpDir, "merged.pdf")

	// Use pdfcpu to merge the input files into a single output PDF.
	err = api.MergeCreateFile(inputPaths, outputPath, false, pdfcpuModel.NewDefaultConfiguration())
	if err != nil {
		return nil, fmt.Errorf("failed to merge PDFs: %w", err)
	}

	// Read the merged PDF from disk into memory.
	mergedData, err := os.ReadFile(outputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read merged PDF output: %w", err)
	}

	// Return the merged PDF as a byte slice.
	return mergedData, nil
}
