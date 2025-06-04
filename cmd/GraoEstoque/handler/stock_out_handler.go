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

// CreateStockOut godoc
// @Summary      Create a new stock-out
// @Description  Creates a new stock-out entry with associated items
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                         true  "Store ID"
// @Param        data        body    dtoRequest.CreateStockOutRequest  true  "Stock-out creation payload"
// @Success      201  {object}  dtoResponse.StockOutResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input or store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out [post]
func CreateStockOut(c *gin.Context) {
	logger.Log.Info("CreateStockOut")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, dtoResponse.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "invalid store id"})
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
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to save stock out"})
		return
	}

	c.JSON(http.StatusCreated, dtoMapper.ToStockOutResponse(mcor))
}

// GetStockOutByID godoc
// @Summary      Get stock-out by ID
// @Description  Retrieves a stock-out entry and its items by ID
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-out ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  dtoResponse.StockOutResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-out ID"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Stock-out not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out/{id} [get]
func GetStockOutByID(c *gin.Context) {
	logger.Log.Info("GetStockOutByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_out ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stockOut, err := stock_out_repository.GetStockOutByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock out: %v", err)
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "StockOut not found"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockOutResponse(stockOut))
}

// ListAllStockOut godoc
// @Summary      List all stock-out entries
// @Description  Retrieves all stock-out entries for the authenticated user and store
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {array}   dtoResponse.StockOutResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out [get]
func ListAllStockOut(c *gin.Context) {
	logger.Log.Info("ListAllStockOut")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, dtoResponse.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "invalid store id"})
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
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to retrieve stock out list"})
		return
	}

	rep := make([]dtoResponse.StockOutResponse, len(outs))
	for i, so := range outs {
		rep[i] = *dtoMapper.ToStockOutResponse(so)
	}

	c.JSON(http.StatusOK, rep)
}

// DeleteStockOut godoc
// @Summary      Delete stock-out by ID
// @Description  Deletes a stock-out entry by its ID
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-out ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204  "Stock-out deleted successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-out ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out/{id} [delete]
func DeleteStockOut(c *gin.Context) {
	logger.Log.Info("DeleteStockOut")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_out ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_out ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_out_repository.DeleteStockOut(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock out: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to delete stock out"})
		return
	}

	c.Status(http.StatusNoContent)
}

// FinalizeStockOutByID godoc
// @Summary      Finalize stock-out by ID
// @Description  Finalizes a stock-out entry, marking it as completed to integrate it to stock
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-out ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204  "Stock-out finalized successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-out ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out/finalize/{id} [post]
func FinalizeStockOutByID(c *gin.Context) {
	logger.Log.Info("FinalizeStockOutByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_out ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_out ID"})
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

// UpdateStockOut godoc
// @Summary      Update a stock-out
// @Description  Updates a stock-out entry and its items
// @Security     BearerAuth
// @Tags         Stock Out
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                          true  "Store ID"
// @Param        data        body    dtoRequest.UpdateStockOutRequest  true  "Stock-out update payload"
// @Success      200  {object}  dtoResponse.StockOutResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/out [put]
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
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockOutResponse(stockOutModel))
}
