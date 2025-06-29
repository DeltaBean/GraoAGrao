package util

import (
	"crypto/sha1"
	"strings"
	"unicode"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"

	"fmt"
	"strconv"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
)

// GenerateEAN8 generates a valid EAN-8 from UUID and description
func GenerateEAN8(itemPackaging model.ItemPackaging, uuid string) (string, error) {
	logger.Log.Info("GenerateEAN8")

	// Step 1: Combine UUID and description
	combined := fmt.Sprintf("%s-%s", uuid, strings.ToLower(itemPackaging.Description))

	// Step 2: Hash the combined string
	hash := sha1.Sum([]byte(combined))
	hexStr := fmt.Sprintf("%x", hash) // hex string like "a94a8fe5ccb19..."

	// Step 3: Extract numeric digits
	digits := make([]rune, 0, 7)
	for _, ch := range hexStr {
		if unicode.IsDigit(ch) {
			digits = append(digits, ch)
		}
		if len(digits) >= 7 {
			break
		}
	}

	if len(digits) < 7 {
		err := fmt.Errorf("could not extract 7 digits from hashed UUID/description")
		logger.Log.Error(err)
		return "", err
	}

	base := string(digits[:7])

	// Step 4: Calculate check digit
	checkDigit, err := calculateEAN8CheckDigit(base)
	if err != nil {
		logger.Log.Error(err)
		return "", err
	}

	ean8 := base + strconv.Itoa(checkDigit)
	logger.Log.Infof("EAN-8 generated: %s", ean8)
	return ean8, nil
}

// calculateEAN8CheckDigit computes the 8th digit of an EAN-8 code based on the first 7
func calculateEAN8CheckDigit(base string) (int, error) {
	logger.Log.Info("calculateEAN8CheckDigit")

	if len(base) != 7 {
		err := fmt.Errorf("EAN-8 base must be 7 digits")
		logger.Log.Error(err)
		return 0, err
	}

	sum := 0
	for i, r := range base {
		digit := int(r - '0')
		if i%2 == 0 {
			sum += 3 * digit
		} else {
			sum += digit
		}
	}

	check := (10 - (sum % 10)) % 10

	logger.Log.Info("Eighth digit sucessfully calculated")

	return check, nil
}
