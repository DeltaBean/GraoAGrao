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

// GetItems godoc
// @Summary      List all items
// @Description  Retrieves all items for the authenticated user within the given store
// @Security     BearerAuth
// @Tags         Item
// @Produce      json
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {array}  dtoResponse.ItemResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /items [get]
func GetItems(c *gin.Context) {
	logger.Log.Info("GetItems")

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

	items, err := item_repository.ListItems(conn, user.ID, storeID)
	if err != nil {
		logger.Log.Error("Error fetching items: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	// Map domain models to response DTOs
	rep := make([]dtoResponse.ItemResponse, len(items))
	for i, item := range items {
		rep[i] = mapper.ToItemResponse(&item)
	}

	c.JSON(http.StatusOK, rep)
}

// GetItemByID godoc
// @Summary      Get an item by ID
// @Description  Retrieves a single item by its ID
// @Security     BearerAuth
// @Tags         Item
// @Produce      json
// @Param        id          path      int     true  "Item ID"
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {object}  dtoResponse.ItemResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid item ID"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Item not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /items/{id} [get]
func GetItemByID(c *gin.Context) {
	logger.Log.Info("GetItemByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Id should be an integer"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	item, err := item_repository.GetItemByID(conn, uint(id))
	if err != nil {
		logger.Log.Error("Error fetching item: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	} else if item == nil {
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "Item not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemResponse(item))
}

// CreateItem godoc
// @Summary      Create a new item
// @Description  Creates a new item in the current store for the authenticated user
// @Security     BearerAuth
// @Tags         Item
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string                     true  "Store ID"
// @Param        data        body      dtoRequest.CreateItemRequest  true  "Item creation payload"
// @Success      201  {object}  dtoResponse.ItemResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input or missing store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /items [post]
func CreateItem(c *gin.Context) {
	logger.Log.Info("CreateItem")

	// Retrieved from BindAndValidate middleware
	req := c.MustGet("dto").(*dtoRequest.CreateItemRequest)

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

	// Map request DTO to domain model
	modelItem := mapper.CreateItemToModel(req, user.ID, storeID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := item_repository.SaveItem(conn, modelItem); err != nil {
		logger.Log.Error("Error saving item: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToItemResponse(modelItem))
}

// UpdateItem godoc
// @Summary      Update an item
// @Description  Updates an existing item for the authenticated user
// @Security     BearerAuth
// @Tags         Item
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string                      true  "Store ID"
// @Param        data        body      dtoRequest.UpdateItemRequest  true  "Item update payload"
// @Success      200  {object}  dtoResponse.ItemResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input or store ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /items [put]
func UpdateItem(c *gin.Context) {
	logger.Log.Info("UpdateItem")

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
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemResponse(updatedItem))
}

// DeleteItem godoc
// @Summary      Delete an item
// @Description  Deletes an item by ID. Returns 409 if the item is referenced by other entities.
// @Security     BearerAuth
// @Tags         Item
// @Accept       json
// @Produce      json
// @Param        id          path      int     true  "Item ID"
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      204  "Item deleted successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse                        "Invalid item ID"
// @Failure      401  {object}  dtoResponse.ErrorResponse                        "Unauthorized"
// @Failure      409  {object}  dtoResponse.ForeignKeyDeleteReferencedErrorResponse  "Item is still referenced"
// @Failure      500  {object}  dtoResponse.ErrorResponse                        "Internal server error"
// @Router       /items/{id} [delete]
func DeleteItem(c *gin.Context) {
	logger.Log.Info("DeleteItem")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Id should be an integer"})
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

// GetItemByEAN13 godoc
// @Summary      Get an item by EAN13
// @Description  Retrieves a single item by its EAN13 code
// @Security     BearerAuth
// @Tags         Item
// @Produce      json
// @Param        ean13        path      string  true  "Item EAN13"
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {object}  dtoResponse.ItemResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid EAN13"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Item not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /items/scan/{ean13} [get]
func GetItemByEAN13(c *gin.Context) {
	logger.Log.Info("GetItemByEAN13")
	ean13 := c.Param("ean13")
	if len(ean13) != 13 {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "EAN13 should be 13 characters"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	item, err := item_repository.GetItemByEAN13(conn, ean13)
	if err != nil {
		logger.Log.Error("Error fetching item by EAN13: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	} else if item == nil {
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "Item not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemResponse(item))
}
