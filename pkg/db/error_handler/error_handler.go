package error_handler

import (
	"errors"
	"net/http"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// RefFetcherFunc abstracts how to retrieve entities referenced by
// a foreign key <id>.
type RefFetcherFunc func(id uint) (any, error)

// Check if error is a foreign key violation
func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}

// Generic handler using injected fetcher
func HandleDBErrorWithContext(c *gin.Context, err error, id uint, fetcher RefFetcherFunc) {
	if isForeignKeyViolation(err) {
		entities, refErr := fetcher(id)
		if refErr != nil {

			logger.Log.Error(refErr)
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Cannot delete this record because it is still in use.",
				"details": "There are references to this record, but we could not fetch them.",
				"code":    "FOREIGN_KEY_VIOLATION",
			})
			return
		}

		c.JSON(http.StatusConflict, gin.H{
			"error":               "Cannot delete this record because it's still referenced.",
			"code":                "FOREIGN_KEY_VIOLATION",
			"referencingEntities": entities,
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}
