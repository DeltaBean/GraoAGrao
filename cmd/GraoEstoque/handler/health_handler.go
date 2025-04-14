package handler

import (
	"net/http"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

func HealthHandler(c *gin.Context) {
	logger.Log.Info("HealthHandler")
	c.JSON(http.StatusOK, gin.H{"status": "API is running"})
}
