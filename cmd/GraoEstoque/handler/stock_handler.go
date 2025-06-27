package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/stock_repository"
	mapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetStock godoc
// @Summary      Get stock
// @Description  Retrieves the current stock for all items in the store for the authenticated user
// @Security     BearerAuth
// @Tags         Stock
// @Produce      json
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {array}  dtoResponse.StockResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stock [get]
func GetStock(c *gin.Context) {
	logger.Log.Info("GetStock")

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

	stock, err := stock_repository.GetStock(conn, user.ID, storeID)
	if err != nil {
		logger.Log.Error("Error fetching stock: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.StockResponse, len(stock))
	for i, st := range stock {
		rep[i] = *mapper.ToStockResponse(&st)
	}

	c.JSON(http.StatusOK, rep)
}

func GetStockByCategory(c *gin.Context) {
	logger.Log.Info("GetStockByCategory")

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

	categoryID, err := strconv.Atoi(c.Param("categoryId"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be a integer"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stock, err := stock_repository.GetStockByCategory(conn, user.ID, categoryID)
	if err != nil {
		logger.Log.Error("Error fetching stock: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, stock)
}
