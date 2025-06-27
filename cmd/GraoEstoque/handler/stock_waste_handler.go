package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	dtoMapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"

	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_waste_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

// CreateStockWaste godoc
// @Summary      Create a new stock waste entry
// @Description  Registers wasted quantity of a stock item with reason and optional image
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                             true  "Store ID"
// @Param        data        body    dtoRequest.CreateStockWasteRequest true  "Stock-waste creation payload"
// @Success      201  {object}  dtoResponse.StockWasteResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste [post]
func CreateStockWaste(c *gin.Context) {
	logger.Log.Info("CreateStockWaste")

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
	req := c.MustGet("dto").(*dtoRequest.CreateStockWasteRequest)
	model := dtoMapper.CreateStockWasteToModel(req, user.ID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "DB connection not found"})
		return
	}

	err = stock_waste_repository.SaveStockWaste(conn, model, storeID)
	if err != nil {
		logger.Log.Errorf("Failed to save stock waste: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to save stock waste"})
		return
	}

	c.JSON(http.StatusCreated, dtoMapper.ToStockWasteResponse(model))
}

// GetStockWasteByID godoc
// @Summary      Get stock waste by ID
// @Description  Retrieves a stock waste entry by its ID
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-waste ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  dtoResponse.StockWasteResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-waste ID"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Stock-waste not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste/{id} [get]
func GetStockWasteByID(c *gin.Context) {
	logger.Log.Info("GetStockWasteByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_waste ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	waste, err := stock_waste_repository.GetStockWasteByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to retrieve stock waste: %v", err)
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "StockWaste not found"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockWasteResponse(waste))
}

// ListAllStockWaste godoc
// @Summary      List all stock waste entries
// @Description  Retrieves all stock waste entries for the authenticated user and store
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {array}   dtoResponse.StockWasteResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste [get]
func ListStockWaste(c *gin.Context) {
	logger.Log.Info("ListAllStockWaste")

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

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	stockWastes, err := stock_waste_repository.ListStockWaste(conn, uint(offset), uint(limit), storeID)
	if err != nil {
		logger.Log.Errorf("Error listing stock waste: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to retrieve stock waste list"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.StockWasteResponse, len(stockWastes))
	for i, sw := range stockWastes {
		rep[i] = dtoMapper.ToStockWasteResponse(sw)
	}

	c.JSON(http.StatusOK, rep)
}

// DeleteStockWaste godoc
// @Summary      Delete stock-waste by ID
// @Description  Deletes a stock-waste entry by its ID
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-waste ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204 "Stock-waste deleted successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-waste ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste/{id} [delete]
func DeleteStockWaste(c *gin.Context) {
	logger.Log.Info("DeleteStockWaste")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_waste ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_waste ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_waste_repository.DeleteStockWasteByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to delete stock waste: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Failed to delete stock waste"})
		return
	}

	c.Status(http.StatusNoContent)
}

// FinalizeStockWasteByID godoc
// @Summary      Finalize stock-waste by ID
// @Description  Finalizes a stock-waste entry, deducting the waste from stock
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Stock-waste ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204  "Stock-waste finalized successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid stock-waste ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste/finalize/{id} [patch]
func FinalizeStockWasteByID(c *gin.Context) {
	logger.Log.Info("FinalizeStockWasteByID")

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		logger.Log.Errorf("Invalid stock_waste ID: %v", err)
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Invalid stock_waste ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err = stock_waste_repository.FinalizeStockWasteByID(conn, id)
	if err != nil {
		logger.Log.Errorf("Failed to finalize stock waste: %v", err)
		error_handler.HandleDBError(c, err, id)
		return
	}

	c.Status(http.StatusNoContent)
}

// UpdateStockWaste godoc
// @Summary      Update a stock-waste entry
// @Description  Updates a stock-waste entry fields like item, quantity, and reason
// @Security     BearerAuth
// @Tags         Stock Waste
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                             true  "Store ID"
// @Param        data        body    dtoRequest.UpdateStockWasteRequest true  "Stock-waste update payload"
// @Success      200  {object}  dtoResponse.StockWasteResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock/waste [put]
func UpdateStockWaste(c *gin.Context) {
	logger.Log.Info("UpdateStockWaste")

	// Retrieved from BindAndValidate middleware
	wasteReq := c.MustGet("dto").(*dtoRequest.UpdateStockWasteRequest)
	wasteModel := dtoMapper.UpdateStockWasteToModel(wasteReq, 0) // You can replace 0 with real user ID if needed

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	err := stock_waste_repository.UpdateStockWaste(conn, wasteModel)
	if err != nil {
		logger.Log.Errorf("Error updating stock waste: %v", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, dtoMapper.ToStockWasteResponse(wasteModel))
}
