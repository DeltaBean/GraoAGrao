package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	dtoMapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"

	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_in_repository"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

// CreateStockIn handles the creation of a StockIn record with its items.
func CreateStockIn(c *gin.Context) {
	logger.Log.Info("CreateStockIn")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Retrieved from BindAndValidate middleware
	cir := c.MustGet("dto").(*dtoRequest.CreateStockInRequest)
	mcir := dtoMapper.CreateStockInToModel(cir)

	err = stock_in_repository.SaveStockIn(mcir, authenticatedUser.ID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save stock in"})
		return
	}

	c.JSON(http.StatusCreated, cir)
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

	stockIn, err := stock_in_repository.GetStockInByID(id)
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

	stockIns, err := stock_in_repository.ListAllStockIn(authenticatedUser.ID)
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

	err = stock_in_repository.DeleteStockIn(id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StockIn deleted successfully"})
}
