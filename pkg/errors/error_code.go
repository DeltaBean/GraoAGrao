package errors

type ErrorCode string

const (
	CodeGenericDataBaseError             ErrorCode = "GENERIC_DATABASE_ERROR"
	CodeDeleteRereferencedEntity         ErrorCode = "DELETE_REFERENCED_ENTITY"
	CodeForeignKeyReferenceMissing       ErrorCode = "FOREIGN_KEY_REFERENCE_MISSING"
	CodeStockInTotalQuantityNotMatching  ErrorCode = "STOCK_IN_TOTAL_QUANTITY_WRONG"
	CodeStockOutTotalQuantityNotMatching ErrorCode = "STOCK_OUT_TOTAL_QUANTITY_WRONG"
	CodeGoogleUserNotFound               ErrorCode = "GOOGLE_USER_NOT_FOUND"
	CodeStartTryOutEnvironment           ErrorCode = "START_TRYOUT_ENVIRONMENT"
)
