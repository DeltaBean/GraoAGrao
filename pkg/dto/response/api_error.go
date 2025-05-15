package response

import (
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
)

type GoogleUserNotFoundErrorResponse struct {
	InternalCode errorCodes.ErrorCode `json:"internal_code"`
	Details      string               `json:"details"`
}
