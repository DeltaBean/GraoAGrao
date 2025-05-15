package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_packaging_repository"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/gin-gonic/gin"
)

func CreateItemPackaging(c *gin.Context) {
	logger.Log.Info("CreateItemPackaging")

	req := c.MustGet("dto").(*request.CreateItemPackagingRequest)

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

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	modelPackaging := mapper.CreateItemPackagingToModel(req, user.ID, storeID)
	if err := item_packaging_repository.SaveItemPackaging(conn, modelPackaging); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving packaging"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToItemPackagingResponse(modelPackaging))
}

func GetItemPackagingByID(c *gin.Context) {
	logger.Log.Info("GetItemPackagingByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	packaging, err := item_packaging_repository.GetItemPackagingByID(conn, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving packaging"})
		return
	}
	if packaging == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Packaging not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemPackagingResponse(packaging))
}

func ListItemPackagings(c *gin.Context) {
	logger.Log.Info("ListItemPackagings")

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

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return

	}
	packagings, err := item_packaging_repository.ListItemPackagingsPaginated(conn, user.ID, storeID, uint(offset), uint(limit))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing packagings"})
		return
	}

	resp := make([]response.ItemPackagingResponse, len(packagings))
	for i, p := range packagings {
		resp[i] = mapper.ToItemPackagingResponse(&p)
	}

	c.JSON(http.StatusOK, resp)
}

func UpdateItemPackaging(c *gin.Context) {
	logger.Log.Info("UpdateItemPackaging")

	req := c.MustGet("dto").(*request.UpdateItemPackagingRequest)
	itemPackModel := mapper.UpdateItemPackagingToModel(req)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	updated, err := item_packaging_repository.UpdateItemPackaging(conn, itemPackModel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating packaging"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemPackagingResponse(updated))
}

func DeleteItemPackaging(c *gin.Context) {
	logger.Log.Info("DeleteItemPackaging")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := item_packaging_repository.DeleteItemPackaging(conn, uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting packaging"})
		return
	}

	c.Status(http.StatusNoContent)
}
