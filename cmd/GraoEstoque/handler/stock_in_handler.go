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

// CreateStockIn godoc
// @Summary      Create a new stock-in
// @Description  Creates a new stock-in entry with associated items
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                         true  "Store ID"
// @Param        data        body    dtoRequest.CreateStockInRequest  true  "Stock-in creation payload"
// @Success      201  {object}  dtoResponse.StockInResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in [post]
func CreateStockIn(c *gin.Context) {
	logger.Log.Info("CreateStockIn")

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
	cir := c.MustGet("dto").(*dtoRequest.CreateStockInRequest)
	mcir := dtoMapper.CreateStockInToModel(cir)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.SaveStockIn(conn, mcir, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock in: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to save stock in"})
		return
	}

	c.JSON(http.StatusCreated, dtoMapper.ToStockInResponse(mcir))
}

// GetStockInByID godoc
// @Summary      Get stock-in by ID
// @Description  Retrieves a stock-in entry and its items by ID
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-in ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  dtoResponse.StockInResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-in ID"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Stock-in not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in/{id} [get]
func GetStockInByID(c *gin.Context) {
	logger.Log.Info("GetStockInByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_in ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stockIn, err := stock_in_repository.GetStockInByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock in: %v", err)
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "StockIn not found"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockInResponse(stockIn))
}

// ListAllStockIn godoc
// @Summary      List all stock-in entries
// @Description  Retrieves all stock-in entries for the authenticated user and store
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {array}   dtoResponse.StockInResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in [get]
func ListAllStockIn(c *gin.Context) {
	logger.Log.Info("ListAllStockIn")

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

	stockIns, err := stock_in_repository.ListAllStockIn(conn, user.ID, storeID)
	if err != nil {
		logger.Log.Errorf("Error listing stock in: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to retrieve stock in list"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.StockInResponse, len(stockIns))
	for i, sti := range stockIns {
		rep[i] = *dtoMapper.ToStockInResponse(sti)
	}

	c.JSON(http.StatusOK, rep)
}

// DeleteStockIn godoc
// @Summary      Delete stock-in by ID
// @Description  Deletes a stock-in entry by its ID
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-in ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204 "Stock-in deleted successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-in ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in/{id} [delete]
func DeleteStockIn(c *gin.Context) {
	logger.Log.Info("DeleteStockIn")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_in ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_in ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_in_repository.DeleteStockIn(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock in: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to delete stock in"})
		return
	}

	c.Status(http.StatusOK)
}

// FinalizeStockInByID godoc
// @Summary      Finalize stock-in by ID
// @Description  Finalizes a stock-in entry, marking it as completed to integrate it to stock
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-in ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204  "Stock-in finalized successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-in ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in/finalize/{id} [patch]
func FinalizeStockInByID(c *gin.Context) {
	logger.Log.Info("FinalizeStockInByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_in ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_in ID"})
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

// UpdateStockIn godoc
// @Summary      Update a stock-in entry
// @Description  Updates a stock-in entry and its items
// @Security     BearerAuth
// @Tags         Stock In
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                          true  "Store ID"
// @Param        data        body    dtoRequest.UpdateStockInRequest  true  "Stock-in update payload"
// @Success      200  {object}  dtoResponse.StockInResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/in [put]
func UpdateStockIn(c *gin.Context) {
	logger.Log.Info("UpdateStockin")

	// Retrieved from BindAndValidate middleware
	stockInReq := c.MustGet("dto").(*dtoRequest.UpdateStockInRequest)
	stockInModel := dtoMapper.UpdateStockInToModel(stockInReq)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err := stock_in_repository.UpdateStockIn(conn, stockInModel)

	if err != nil {
		logger.Log.Error("Error updating item: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockInResponse(stockInModel))
}
