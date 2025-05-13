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
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetItems returns all items for the authenticated user
func GetItems(c *gin.Context) {
	logger.Log.Info("GetItems")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		}
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
		c.Abort()
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	items, err := item_repository.ListItems(conn, user.ID, storeID)
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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	item, err := item_repository.GetItemByID(conn, uint(id))
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

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		}
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
		c.Abort()
		return
	}

	// Map request DTO to domain model
	modelItem := mapper.CreateItemToModel(req, user.ID, storeID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := item_repository.SaveItem(conn, modelItem); err != nil {
		logger.Log.Error("Error saving item: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToItemResponse(modelItem))
}

// UpdateItem updates an existing item with the validated DTO
func UpdateItem(c *gin.Context) {
	logger.Log.Info("UpdateItem")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		}
		c.Abort()
		return
	}

	// Retrieved from BindAndValidate middleware
	itemReq := c.MustGet("dto").(*dtoRequest.UpdateItemRequest)
	itemModel := mapper.UpdateItemToModel(itemReq, user.ID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	updatedItem, err := item_repository.UpdateItem(conn, itemModel)

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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := item_repository.DeleteItem(conn, uint(id)); err != nil {
		logger.Log.Error("Error deleting item: ", err)
		error_handler.HandleDBErrorWithReferencingFetcher(c,
			err,
			uint(id),
			item_repository.GetReferencingItemPackagings,
			func(entities any) any {
				internal := entities.([]model.ItemPackaging)
				var dtos []dtoResponse.ItemPackagingResponse
				for _, s := range internal {
					dtos = append(dtos, mapper.ToItemPackagingResponse(&s))
				}
				return dtos
			})
		return
	}

	c.Status(http.StatusNoContent)
}
