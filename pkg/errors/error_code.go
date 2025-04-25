package errors

type ErrorCode string

const (
	CodeGenericDataBaseError       ErrorCode = "GENERIC_DATABASE_ERROR"
	CodeDeleteRereferencedEntity   ErrorCode = "DELETE_REFERENCED_ENTITY"
	CodeForeignKeyReferenceMissing ErrorCode = "FOREIGN_KEY_REFERENCE_MISSING"
)
