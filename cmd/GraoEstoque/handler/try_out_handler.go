package handler

import (
	"net/http"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_repository"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

// GetTryOutJobStatus responds with the status of a try-out job.
func GetTryOutJobStatus(c *gin.Context) {
	uuid := c.Query("uuid")
	logger.Log.Infof("GetTryOutJobStatus uuid:%s", uuid)

	status, err := tryout_repository.GetTryOutJobStatusByUuid(uuid)
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"details": "Error fetching try-out job status",
		})
	}

	// 3) Return JSON payload
	c.JSON(http.StatusOK, gin.H{
		"uuid":   uuid,
		"status": status,
	})
}
