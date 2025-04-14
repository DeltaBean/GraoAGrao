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

// CreateStockOut handles the creation of a StockOut record with its items.
func CreateStockOut(c *gin.Context) {
	logger.Log.Info("CreateStockOut")

	var StockOut model.StockOut
	if err := c.ShouldBindJSON(&StockOut); err != nil {
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

	err = data_handler.SaveStockOut(&StockOut, authenticatedUser.ID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save stock out"})
		return
	}

	c.JSON(http.StatusCreated, StockOut)
}

// GetStockOutByID retrieves a StockOut by its ID and includes the items.
func GetStockOutByID(c *gin.Context) {
	logger.Log.Info("GetStockOutByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_out ID"})
		return
	}

	StockOut, err := data_handler.GetStockOutByID(id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock out: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "StockOut not found"})
		return
	}

	c.JSON(http.StatusOK, StockOut)
}

// ListAllStockOut retrieves all StockOut entries
func ListAllStockOut(c *gin.Context) {
	logger.Log.Info("ListAllStockOut")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	StockOuts, err := data_handler.ListAllStockOut(authenticatedUser.ID)
	if err != nil {
		logger.Log.Errorf("Error listing stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stock out list"})
		return
	}

	c.JSON(http.StatusOK, StockOuts)
}

// DeleteStockOut deletes a stock-in by ID
func DeleteStockOut(c *gin.Context) {
	logger.Log.Info("DeleteStockOut")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_out ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_out ID"})
		return
	}

	err = data_handler.DeleteStockOut(id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock out"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StockOut deleted successfully"})
}
