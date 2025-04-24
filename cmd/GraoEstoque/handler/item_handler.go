package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	mapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetItems returns all items for the authenticated user
func GetItems(c *gin.Context) {
	logger.Log.Info("GetItems")

	token := c.GetHeader("Authorization")
	user, err := util.GetUserFromJWT(token)
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	items, err := item_repository.ListItems(user.ID)
	if err != nil {
		logger.Log.Error("Error fetching items: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.ItemResponse, len(items))
	for i, item := range items {
		rep[i] = mapper.ToItemResponse(&item)
	}

	c.JSON(http.StatusOK, rep)
}

// GetItemByID returns a single item by its ID
func GetItemByID(c *gin.Context) {
	logger.Log.Info("GetItemByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be an integer"})
		return
	}

	item, err := item_repository.GetItemByID(uint(id))
	if err != nil {
		logger.Log.Error("Error fetching item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	} else if item == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Item not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemResponse(item))
}

// CreateItem creates a new item from the validated DTO
func CreateItem(c *gin.Context) {
	logger.Log.Info("CreateItem")

	// Retrieved from BindAndValidate middleware
	req := c.MustGet("dto").(*dtoRequest.CreateItemRequest)

	token := c.GetHeader("Authorization")
	user, err := util.GetUserFromJWT(token)
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Map request DTO to domain model
	modelItem := mapper.CreateItemToModel(req, user.ID)
	if err := item_repository.SaveItem(modelItem, user.ID); err != nil {
		logger.Log.Error("Error saving item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToItemResponse(modelItem))
}

// UpdateItem updates an existing item with the validated DTO
func UpdateItem(c *gin.Context) {
	logger.Log.Info("UpdateItem")

	token := c.GetHeader("Authorization")
	user, err := util.GetUserFromJWT(token)
	if err != nil {
		logger.Log.Error("Error getting user from JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	// Retrieved from BindAndValidate middleware
	itemReq := c.MustGet("dto").(*dtoRequest.UpdateItemRequest)
	itemModel := mapper.UpdateItemToModel(itemReq, user.ID)

	updatedItem, err := item_repository.UpdateItem(itemModel)

	if err != nil {
		logger.Log.Error("Error updating item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemResponse(updatedItem))
}

// DeleteItem removes an item by its ID
func DeleteItem(c *gin.Context) {
	logger.Log.Info("DeleteItem")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id should be an integer"})
		return
	}

	if err := item_repository.DeleteItem(uint(id)); err != nil {
		logger.Log.Error("Error deleting item: ", err)
		error_handler.HandleDBErrorWithContext(c, err, uint(id), item_repository.GetReferencingStockPackagings)
		return
	}

	c.Status(http.StatusNoContent)
}
