package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/item_packaging_repository"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

func CreateItemPackaging(c *gin.Context) {
	logger.Log.Info("CreateItemPackaging")

	req := c.MustGet("dto").(*request.CreateItemPackagingRequest)

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	storeID, err := strconv.Atoi(c.GetHeader("X-Store-ID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	modelPackaging := mapper.CreateItemPackagingToModel(req, user.ID, uint(storeID))
	if err := item_packaging_repository.SaveItemPackaging(modelPackaging); err != nil {
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

	packaging, err := item_packaging_repository.GetItemPackagingByID(uint(id))
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

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	storeID, err := strconv.Atoi(c.GetHeader("X-Store-ID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	packagings, err := item_packaging_repository.ListItemPackagingsPaginated(user.ID, uint(storeID), uint(offset), uint(limit))
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

	updated, err := item_packaging_repository.UpdateItemPackaging(itemPackModel)
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

	if err := item_packaging_repository.DeleteItemPackaging(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting packaging"})
		return
	}

	c.Status(http.StatusNoContent)
}
