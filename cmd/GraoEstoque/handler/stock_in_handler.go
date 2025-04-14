package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	data_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/gin-gonic/gin"
)

// CreateStockIn handles the creation of a StockIn record with its items.
func CreateStockIn(c *gin.Context) {
	logger.Log.Info("CreateStockIn")

	var stockIn model.StockIn
	if err := c.ShouldBindJSON(&stockIn); err != nil {
		logger.Log.Errorf("Invalid payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	err = data_handler.SaveStockIn(&stockIn, authenticatedUser.ID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save stock in"})
		return
	}

	c.JSON(http.StatusCreated, stockIn)
}

// GetStockInByID retrieves a StockIn by its ID and includes the items.
func GetStockInByID(c *gin.Context) {
	logger.Log.Info("GetStockInByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_in ID"})
		return
	}

	stockIn, err := data_handler.GetStockInByID(id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock in: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "StockIn not found"})
		return
	}

	c.JSON(http.StatusOK, stockIn)
}

// ListAllStockIn retrieves all StockIn entries
func ListAllStockIn(c *gin.Context) {
	logger.Log.Info("ListAllStockIn")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	stockIns, err := data_handler.ListAllStockIn(authenticatedUser.ID)
	if err != nil {
		logger.Log.Errorf("Error listing stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stock in list"})
		return
	}

	c.JSON(http.StatusOK, stockIns)
}

// DeleteStockIn deletes a stock-in by ID
func DeleteStockIn(c *gin.Context) {
	logger.Log.Info("DeleteStockIn")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_in ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_in ID"})
		return
	}

	err = data_handler.DeleteStockIn(id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StockIn deleted successfully"})
}
