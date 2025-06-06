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

// GetStores returns all stores created by the authenticated user
func GetStores(c *gin.Context) {
	logger.Log.Info("GetStores")

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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	stores, err := store_repository.ListStoresPaginated(conn, user.ID, 0, 100)
	if err != nil {
		logger.Log.Error("Error fetching stores: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	var res []dtoResponse.StoreResponse
	for _, s := range stores {
		res = append(res, mapper.ToStoreResponse(&s))
	}

	c.JSON(http.StatusOK, res)
}

// GetStoreByID returns a single store by ID
func GetStoreByID(c *gin.Context) {
	logger.Log.Info("GetStoreByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id must be a number"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	store, err := store_repository.GetStoreByID(conn, uint(id))
	if err != nil {
		logger.Log.Error("Error getting store: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	} else if store == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Store not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStoreResponse(store))
}

// CreateStore creates a new store from DTO
func CreateStore(c *gin.Context) {
	logger.Log.Info("CreateStore")

	req := c.MustGet("dto").(*dtoRequest.CreateStoreRequest)

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

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	storeModel := mapper.CreateStoreToModel(req, user.ID)
	if err := store_repository.SaveStore(conn, storeModel, user.ID); err != nil {
		logger.Log.Error("Error saving store:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToStoreResponse(storeModel))
}

// UpdateStore updates a store by ID
func UpdateStore(c *gin.Context) {
	logger.Log.Info("UpdateStore")

	req := c.MustGet("dto").(*dtoRequest.UpdateStoreRequest)

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
	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}
	store := mapper.UpdateStoreToModel(req, user.ID)
	updated, err := store_repository.UpdateStore(conn, store)
	if err != nil {
		logger.Log.Error("Error updating store: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToStoreResponse(updated))
}

// DeleteStore deletes a store by ID
func DeleteStore(c *gin.Context) {
	logger.Log.Info("DeleteStore")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id must be a number"})
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
