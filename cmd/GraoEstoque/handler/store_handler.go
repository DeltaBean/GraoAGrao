package handler

import (
	"net/http"
	"strconv"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/store_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	mapper "github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetStores godoc
// @Summary      List all stores
// @Description  Retrieves all stores created by the authenticated user
// @Security     BearerAuth
// @Tags         Store
// @Accept       json
// @Produce      json
// @Success      200  {array}  dtoResponse.StoreResponse
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stores [get]
func GetStores(c *gin.Context) {
	logger.Log.Info("GetStores")

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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stores, err := store_repository.ListStoresPaginated(conn, user.ID, 0, 100)
	if err != nil {
		logger.Log.Error("Error fetching stores: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	var res []dtoResponse.StoreResponse
	for _, s := range stores {
		res = append(res, mapper.ToStoreResponse(&s))
	}

	c.JSON(http.StatusOK, res)
}

// GetStoreByID godoc
// @Summary      Get store by ID
// @Description  Retrieves a single store by its ID
// @Security     BearerAuth
// @Tags         Store
// @Accept       json
// @Produce      json
// @Param        id   path     int  true  "Store ID"
// @Success      200  {object}  dtoResponse.StoreResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid ID"
// @Failure      404  {object}  dtoResponse.ErrorResponse "Store not found"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stores/{id} [get]
func GetStoreByID(c *gin.Context) {
	logger.Log.Info("GetStoreByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Id must be a number"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	store, err := store_repository.GetStoreByID(conn, uint(id))
	if err != nil {
		logger.Log.Error("Error getting store: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	} else if store == nil {
		c.JSON(http.StatusNotFound, dtoResponse.ErrorResponse{Error: "Store not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStoreResponse(store))
}

// CreateStore godoc
// @Summary      Create a new store
// @Description  Creates a new store for the authenticated user
// @Security     BearerAuth
// @Tags         Store
// @Accept       json
// @Produce      json
// @Param        data  body  dtoRequest.CreateStoreRequest  true  "Store creation payload"
// @Success      201  {object}  dtoResponse.StoreResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stores [post]
func CreateStore(c *gin.Context) {
	logger.Log.Info("CreateStore")

	req := c.MustGet("dto").(*dtoRequest.CreateStoreRequest)

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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	storeModel := mapper.CreateStoreToModel(req, user.ID)
	if err := store_repository.SaveStore(conn, storeModel, user.ID); err != nil {
		logger.Log.Error("Error saving store:", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToStoreResponse(storeModel))
}

// UpdateStore godoc
// @Summary      Update a store
// @Description  Updates an existing store for the authenticated user
// @Security     BearerAuth
// @Tags         Store
// @Accept       json
// @Produce      json
// @Param        data  body  dtoRequest.UpdateStoreRequest  true  "Store update payload"
// @Success      200  {object}  dtoResponse.StoreResponse
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid input"
// @Failure      401  {object}  dtoResponse.ErrorResponse "Unauthorized"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stores [put]
func UpdateStore(c *gin.Context) {
	logger.Log.Info("UpdateStore")

	req := c.MustGet("dto").(*dtoRequest.UpdateStoreRequest)

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
	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}
	store := mapper.UpdateStoreToModel(req, user.ID)
	updated, err := store_repository.UpdateStore(conn, store)
	if err != nil {
		logger.Log.Error("Error updating store: ", err)
		c.JSON(http.StatusInternalServerError, dtoResponse.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStoreResponse(updated))
}

// DeleteStore godoc
// @Summary      Delete a store
// @Description  Deletes a store by its ID
// @Security     BearerAuth
// @Tags         Store
// @Accept       json
// @Produce      json
// @Param        id   path     int  true  "Store ID"
// @Success      204  "Store deleted successfully"
// @Failure      400  {object}  dtoResponse.ErrorResponse "Invalid ID"
// @Failure      500  {object}  dtoResponse.ErrorResponse "Internal server error"
// @Router       /stores/{id} [delete]
func DeleteStore(c *gin.Context) {
	logger.Log.Info("DeleteStore")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dtoResponse.ErrorResponse{Error: "Id must be a number"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := store_repository.DeleteStore(conn, uint(id)); err != nil {
		logger.Log.Error("Error deleting store:", err)
		error_handler.HandleDBErrorWithReferencingFetcher(c,
			err,
			uint(id),
			nil, // optionally pass referencing entities fetcher
			nil,
		)
		return
	}

	c.Status(http.StatusNoContent)
}
