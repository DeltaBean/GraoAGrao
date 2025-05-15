package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	dtoMapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"

	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_in_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

// CreateStockIn handles the creation of a StockIn record with its items.
func CreateStockIn(c *gin.Context) {
	logger.Log.Info("CreateStockIn")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	// Retrieved from BindAndValidate middleware
	cir := c.MustGet("dto").(*dtoRequest.CreateStockInRequest)
	mcir := dtoMapper.CreateStockInToModel(cir)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.SaveStockIn(conn, mcir, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save stock in"})
		return
	}

	c.JSON(http.StatusCreated, dtoMapper.ToStockInResponse(mcir))
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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stockIn, err := stock_in_repository.GetStockInByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock in: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "StockIn not found"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockInResponse(stockIn))
}

// ListAllStockIn retrieves all StockIn entries
func ListAllStockIn(c *gin.Context) {
	logger.Log.Info("ListAllStockIn")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stockIns, err := stock_in_repository.ListAllStockIn(conn, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Error listing stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stock in list"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.StockInResponse, len(stockIns))
	for i, sti := range stockIns {
		rep[i] = *dtoMapper.ToStockInResponse(sti)
	}

	c.JSON(http.StatusOK, rep)
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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.DeleteStockIn(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock in: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StockIn deleted successfully"})
}

func FinalizeStockInByID(c *gin.Context) {
	logger.Log.Info("FinalizeStockInByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_in ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_in ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.FinalizeStockInByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to finalize stock in: %v", err)
		error_handler.HandleDBError(c, err, id)
		return
	}

	c.Status(http.StatusNoContent)
}

func UpdateStockIn(c *gin.Context) {
	logger.Log.Info("UpdateStockin")

	token := c.GetHeader("Authorization")
	_, err := util.GetUserFromJWT(token)
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Retrieved from BindAndValidate middleware
	stockInReq := c.MustGet("dto").(*dtoRequest.UpdateStockInRequest)
	stockInModel := dtoMapper.UpdateStockInToModel(stockInReq)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.UpdateStockIn(conn, stockInModel)

	if err != nil {
		logger.Log.Error("Error updating item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockInResponse(stockInModel))
}
