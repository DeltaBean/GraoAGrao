package handler

import (
	"net/http"
	"strconv"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/category_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	logger.Log.Info("GetCategories")
	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to authenticate"})
		return
	}

	storeID, err := strconv.Atoi(c.GetHeader("X-Store-ID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	cats, err := category_repository.ListCategories(user.ID, uint(storeID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list categories"})
		return
	}

	// map slice of model → slice of DTO
	resp := make([]response.CategoryResponse, len(cats))
	for i, cat := range cats {
		resp[i] = *mapper.ToCategoryResponse(cat)
	}
	c.JSON(http.StatusOK, resp)
}

func GetCategoryByID(c *gin.Context) {
	logger.Log.Info("GetCategoryByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	cat, err := category_repository.GetCategoryByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch"})
		return
	} else if cat == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToCategoryResponse(cat))
}

func CreateCategory(c *gin.Context) {
	logger.Log.Info("CreateCategory")

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to authenticate"})
		return
	}

	storeID, err := strconv.Atoi(c.GetHeader("X-Store-ID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
		return
	}

	// pulled from middleware
	req := c.MustGet("dto").(*request.CreateCategoryRequest)

	modelCat := mapper.CreateCategoryToModel(req, user.ID, uint(storeID))
	if err := category_repository.SaveCategory(modelCat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToCategoryResponse(modelCat))
}

func UpdateCategory(c *gin.Context) {
	logger.Log.Info("UpdateCategory")
	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to authenticate"})
		return
	}

	// pulled from middleware
	cat := c.MustGet("dto").(*request.UpdateCategoryRequest)
	catModel := mapper.UpdateCategoryToModel(cat, user.ID)

	updatedCategory, err := category_repository.UpdateCategory(user.ID, catModel)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToCategoryResponse(updatedCategory))
}

func DeleteCategory(c *gin.Context) {
	logger.Log.Info("DeleteCategory")
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		logger.Log.Error("Error invalid id: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := category_repository.DeleteCategory(uint(id)); err != nil {
		logger.Log.Error("Error DeleteCategory: ", err)
		error_handler.HandleDBErrorWithReferencingFetcher(c,
			err,
			uint(id),
			category_repository.GetReferencingItems,
			func(entities any) any {
				internal := entities.([]model.Item)
				var dtos []response.ItemResponse
				for _, i := range internal {
					dtos = append(dtos, mapper.ToItemResponse(&i))
				}
				return dtos
			})
		return
	}

	c.Status(http.StatusNoContent)
}
