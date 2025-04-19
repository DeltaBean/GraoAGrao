package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	data_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

func CreateStockPackaging(c *gin.Context) {
	logger.Log.Info("CreateStockPackaging")

	var packaging model.StockPackaging

	if err := c.ShouldBindJSON(&packaging); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = data_handler.SaveStockPackaging(&packaging, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving packaging"})
		return
	}

	c.JSON(http.StatusCreated, packaging)
}

func GetStockPackagingByID(c *gin.Context) {
	logger.Log.Info("GetStockPackagingByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	packaging, err := data_handler.GetStockPackagingByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving packaging"})
		return
	}
	if packaging == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Packaging not found"})
		return
	}

	c.JSON(http.StatusOK, packaging)
}

func ListStockPackagings(c *gin.Context) {
	logger.Log.Info("ListStockPackagings")

	user, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	packagings, err := data_handler.ListStockPackagingsPaginated(user.ID, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing packagings"})
		return
	}

	c.JSON(http.StatusOK, packagings)
}

func UpdateStockPackaging(c *gin.Context) {
	logger.Log.Info("UpdateStockPackaging")

	var p model.StockPackaging

	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := data_handler.UpdateStockPackaging(&p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating packaging"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func DeleteStockPackaging(c *gin.Context) {
	logger.Log.Info("DeleteStockPackaging")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	err = data_handler.DeleteStockPackaging(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting packaging"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Packaging deleted"})
}
