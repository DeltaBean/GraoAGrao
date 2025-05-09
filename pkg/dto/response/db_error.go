package response

import (
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
)

type GenericPostgreSQLErrorResponse struct {
	Error        string               `json:"error"`
	Code         string               `json:"code"`
	InternalCode errorCodes.ErrorCode `json:"internal_code"`
	Details      string               `json:"details"`
}

type ForeignKeyDeleteReferencedErrorResponse struct {
	Error               string               `json:"error"`
	Code                string               `json:"code"`
	InternalCode        errorCodes.ErrorCode `json:"internal_code"`
	Details             string               `json:"details"`
	ReferencedTable     string               `json:"referencedTable"`
	ReferencingEntities any                  `json:"referencingEntities"`
}

type ForeignKeyReferenceMissingErrorResponse struct {
	Error           string               `json:"error"`
	Code            string               `json:"code"`
	InternalCode    errorCodes.ErrorCode `json:"internal_code"`
	Details         string               `json:"details"`
	ReferencedTable string               `json:"referencedTable"`
}

type StockInTotalQuantityNotMatchingResponse struct {
	Error        string               `json:"error"`
	Code         string               `json:"code"`
	InternalCode errorCodes.ErrorCode `json:"internal_code"`
	Details      string               `json:"details"`
}

type StockOutTotalQuantityNotMatchingResponse struct {
	Error        string               `json:"error"`
	Code         string               `json:"code"`
	InternalCode errorCodes.ErrorCode `json:"internal_code"`
	Details      string               `json:"details"`
}
