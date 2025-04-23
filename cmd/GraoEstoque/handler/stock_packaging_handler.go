package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"

	data_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

func CreateStockPackaging(c *gin.Context) {
	logger.Log.Info("CreateStockPackaging")

	req := c.MustGet("dto").(*request.CreateStockPackagingRequest)

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	modelPackaging := mapper.CreateStockPackagingToModel(req)
	if err := data_handler.SaveStockPackaging(modelPackaging, user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving packaging"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToStockPackagingResponse(modelPackaging))
}

func GetStockPackagingByID(c *gin.Context) {
	logger.Log.Info("GetStockPackagingByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	packaging, err := data_handler.GetStockPackagingByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving packaging"})
		return
	}
	if packaging == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Packaging not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStockPackagingResponse(packaging))
}

func ListStockPackagings(c *gin.Context) {
	logger.Log.Info("ListStockPackagings")

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	packagings, err := data_handler.ListStockPackagingsPaginated(user.ID, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing packagings"})
		return
	}

	resp := make([]response.StockPackagingResponse, len(packagings))
	for i, p := range packagings {
		resp[i] = *mapper.ToStockPackagingResponse(&p)
	}

	c.JSON(http.StatusOK, resp)
}

func UpdateStockPackaging(c *gin.Context) {
	logger.Log.Info("UpdateStockPackaging")

	req := c.MustGet("dto").(*request.UpdateStockPackagingRequest)
	stockPackModel := mapper.UpdateStockPackagingToModel(req)

	updated, err := data_handler.UpdateStockPackaging(stockPackModel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating packaging"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStockPackagingResponse(updated))
}

func DeleteStockPackaging(c *gin.Context) {
	logger.Log.Info("DeleteStockPackaging")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := data_handler.DeleteStockPackaging(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting packaging"})
		return
	}

	c.Status(http.StatusNoContent)
}
