package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_repository"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

func GetStock(c *gin.Context) {
	logger.Log.Info("GetStock")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	stock, err := stock_repository.GetStock(authenticatedUser.ID)
	if err != nil {
		logger.Log.Error("Error fetching stock: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, stock)
}

func GetStockByCategory(c *gin.Context) {
	logger.Log.Info("GetStockByCategory")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	categoryID, err := strconv.Atoi(c.Param("categoryId"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be a integer"})
		return
	}

	stock, err := stock_repository.GetStockByCategory(authenticatedUser.ID, categoryID)
	if err != nil {
		logger.Log.Error("Error fetching stock: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, stock)
}
