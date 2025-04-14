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

func GetItems(c *gin.Context) {
	logger.Log.Info("GetItems")

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	items, err := data_handler.ListItems(authenticatedUser.ID)
	if err != nil {
		logger.Log.Error("Error fetching items: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, items)
}

func GetItemByID(c *gin.Context) {
	logger.Log.Info("GetItemByID")
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be a integer"})
		return
	}

	item, err := data_handler.GetItemByID(id)

	if err != nil {
		logger.Log.Error("Error fetching item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	} else if item == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Item not found"})
		return
	}

	c.JSON(http.StatusOK, item)
}

func CreateItem(c *gin.Context) {
	logger.Log.Info("CreateItem")

	var newItem model.Item

	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authenticatedUser, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	err = data_handler.SaveItem(&newItem, authenticatedUser.ID)
	if err != nil {
		logger.Log.Error("Error saving item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, newItem)
}

func UpdateItem(c *gin.Context) {
	logger.Log.Info("UpdateItem")

	var updatedItem model.Item

	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := data_handler.UpdateItem(&updatedItem)
	if err != nil {
		logger.Log.Error("Error updating item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, updatedItem)
}

func DeleteItem(c *gin.Context) {
	logger.Log.Info("DeleteItem")

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be a integer"})
		return
	}

	err = data_handler.DeleteItem(id)

	if err != nil {
		logger.Log.Error("Error deleting item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted"})
}
