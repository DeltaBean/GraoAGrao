package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	dtoMapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"

	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_out_repository"
	error_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

// CreateStockOut handles the creation of a StockOut record with its items.
func CreateStockOut(c *gin.Context) {
	logger.Log.Info("CreateStockOut")

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
	cor := c.MustGet("dto").(*dtoRequest.CreateStockOutRequest)
	mcor := dtoMapper.CreateStockOutToModel(cor)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_out_repository.SaveStockOut(conn, mcor, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save stock out"})
		return
	}

	c.JSON(http.StatusCreated, dtoMapper.ToStockOutResponse(mcor))
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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stockOut, err := stock_out_repository.GetStockOutByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock out: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "StockOut not found"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockOutResponse(stockOut))
}

// ListAllStockOut retrieves all StockOut entries for the authenticated user.
func ListAllStockOut(c *gin.Context) {
	logger.Log.Info("ListAllStockOut")

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

	outs, err := stock_out_repository.ListAllStockOut(conn, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Error listing stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve stock out list"})
		return
	}

	rep := make([]dtoResponse.StockOutResponse, len(outs))
	for i, so := range outs {
		rep[i] = *dtoMapper.ToStockOutResponse(so)
	}

	c.JSON(http.StatusOK, rep)
}

// DeleteStockOut deletes a stock-out by ID.
func DeleteStockOut(c *gin.Context) {
	logger.Log.Info("DeleteStockOut")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_out ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_out ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_out_repository.DeleteStockOut(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock out: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete stock out"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "StockOut deleted successfully"})
}

// FinalizeStockOutByID sets the status of the given stock-out to 'finalized'.
func FinalizeStockOutByID(c *gin.Context) {
	logger.Log.Info("FinalizeStockOutByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_out ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stock_out ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_out_repository.FinalizeStockOutByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to finalize stock out: %v", err)
		error_handler.HandleDBError(c, err, id)
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdateStockOut updates a stock-out and returns the updated record.
func UpdateStockOut(c *gin.Context) {
	logger.Log.Info("UpdateStockOut")

	// Retrieved from BindAndValidate middleware
	stockOutReq := c.MustGet("dto").(*dtoRequest.UpdateStockOutRequest)
	stockOutModel := dtoMapper.UpdateStockOutToModel(stockOutReq)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err := stock_out_repository.UpdateStockOut(conn, stockOutModel)
	if err != nil {
		logger.Log.Error("Error updating stock out: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockOutResponse(stockOutModel))
}
