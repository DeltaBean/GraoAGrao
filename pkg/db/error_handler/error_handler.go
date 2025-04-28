package error_handler

import (
	"errors"
	"net/http"
	"regexp"
	"strings"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	dto "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// Foreign Key Constraint Violation
// Returns true if the error is due to trying to delete a record that is still referenced
func IsDeleteReferencedError(pgErr *pgconn.PgError) bool {

	return pgErr.Code == "23503" &&
		strings.Contains(pgErr.Detail, "is still referenced")
}

// Foreign Key Constraint Violation
// Returns true if the error is due to referencing a non-existent record
func IsReferenceMissingError(pgErr *pgconn.PgError) bool {
	return pgErr.Code == "23503" &&
		strings.Contains(pgErr.Detail, "is not present")
}

// Extracts the referenced table name from pgErr.Detail (if present)
func GetReferencedTableName(pgErr *pgconn.PgError) string {
	if pgErr == nil || pgErr.Detail == "" {
		return ""
	}

	// Regex to extract the table name from the Detail string
	re := regexp.MustCompile(`table\s+"([^"]+)"`)
	matches := re.FindStringSubmatch(pgErr.Detail)
	if len(matches) >= 2 {
		return matches[1] // The table name
	}
	return ""
}

// RefFetcherFunc abstracts how to retrieve entities referenced by
// a foreign key <id>.
// For a example check GetReferencingItemPackagings in item_repository.
type RefFetcherFunc func(id uint) (any, error)

// Represents a function that takes the repository's return (usually a slice of models)
// and returns a DTO-compliant version.
type EntityMapperFunc func(any) any

// Generic handler using injected fetcher
func HandleDBErrorWithContext(c *gin.Context, err error, id uint, fetcher RefFetcherFunc, dtoMapper EntityMapperFunc) {
	logger.Log.Info("HandleDBErrorWithContext")

	var pgErr *pgconn.PgError

	//Check if is a PostgreSQL error
	if errors.As(err, &pgErr) {

		if IsDeleteReferencedError(pgErr) {

			entities, refErr := fetcher(id)

			if refErr != nil {

				logger.Log.Error(refErr)

				c.JSON(http.StatusConflict,
					dto.ForeignKeyDeleteReferencedErrorResponse{
						Error:           "Cannot delete this record because it is still in use.",
						Details:         "There are references to this record it cannot be deleted, but we could not fetch them.",
						ReferencedTable: GetReferencedTableName(pgErr),
						Code:            pgErr.Code,
					})
				return
			}

			// Apply mapper if provided
			var dtoEntities any
			if dtoMapper != nil {
				dtoEntities = dtoMapper(entities)
			} else {
				dtoEntities = entities
			}

			c.JSON(http.StatusConflict,
				dto.ForeignKeyDeleteReferencedErrorResponse{
					Error:               "Cannot delete this record because it's still referenced.",
					Code:                pgErr.Code,
					InternalCode:        errorCodes.CodeDeleteRereferencedEntity,
					Details:             pgErr.Detail,
					ReferencedTable:     GetReferencedTableName(pgErr),
					ReferencingEntities: dtoEntities,
				})
			return

		} else if IsReferenceMissingError(pgErr) {
			// Trying to insert/update a child row with non-existing reference
			c.JSON(http.StatusBadRequest,
				dto.ForeignKeyReferenceMissingErrorResponse{
					Error:           "Cannot reference a non-existent record.",
					InternalCode:    errorCodes.CodeForeignKeyReferenceMissing,
					Details:         "There are references to this record it cannot be deleted",
					ReferencedTable: GetReferencedTableName(pgErr),
					Code:            pgErr.Code,
				})
			return
		}

		c.JSON(http.StatusInternalServerError,
			dto.GenericPostgreSQLErrorResponse{
				Error:        "Generic PostgreSQL Error",
				InternalCode: errorCodes.CodeGenericDataBaseError,
				Details:      pgErr.Detail,
				Code:         pgErr.Code,
			})
		return
	}

	logger.Log.Error("Error isnt a Postgresql error. Verify if HandleDBErrorWithContext is being called in a correct context.")
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}
