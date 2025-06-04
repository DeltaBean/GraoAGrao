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
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetCategories godoc
// @Summary      List all categories
// @Description  Get all categories for the authenticated user in the specified store
// @Security BearerAuth
// @Tags         Category
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {array} response.CategoryResponse
// @Failure      400  {object} response.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object} response.ErrorResponse "Unauthorized"
// @Failure      500  {object} response.ErrorResponse "Internal server error"
// @Router       /items/categories [get]
func GetCategories(c *gin.Context) {
	logger.Log.Info("GetCategories")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	cats, err := category_repository.ListCategories(conn, user.ID, storeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "could not list categories"})
		return
	}

	// map slice of model → slice of DTO
	resp := make([]response.CategoryResponse, len(cats))
	for i, cat := range cats {
		resp[i] = *mapper.ToCategoryResponse(cat)
	}
	c.JSON(http.StatusOK, resp)
}

// GetCategoryByID godoc
// @Summary      Get a category by ID
// @Description  Retrieves a single category by its ID
// @Security     BearerAuth
// @Tags         Category
// @Accept       json
// @Produce      json
// @Param        id          path      int     true  "Category ID"
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      200  {object} response.CategoryResponse
// @Failure      400  {object} response.ErrorResponse "Invalid ID"
// @Failure      404  {object} response.ErrorResponse "Category not found"
// @Failure      500  {object} response.ErrorResponse "Internal server error"
// @Router       /items/categories/{id} [get]
func GetCategoryByID(c *gin.Context) {
	logger.Log.Info("GetCategoryByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "invalid id"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	cat, err := category_repository.GetCategoryByID(conn, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to fetch"})
		return
	} else if cat == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Error: "Category not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToCategoryResponse(cat))
}

// @Summary Create Category
// @Description Create a stock category
// @Security BearerAuth
// @Tags Category
// @Accept json
// @Produce json
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Param category body request.CreateCategoryRequest true "Create category request"
// @Success 200 {object} response.CategoryResponse
// @Failure      400  {object} response.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object} response.ErrorResponse "Unauthorized"
// @Failure 	 500  {object} response.ErrorResponse "Internal Server Error"
// @Router /items/categories [post]
func CreateCategory(c *gin.Context) {
	logger.Log.Info("CreateCategory")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	storeID, err := util.GetStoreIDFromContext(c)
	if err != nil {
		if err == util.ErrNoStoreID {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "store id not found"})
		} else {
			c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "invalid store id"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	// pulled from middleware
	req := c.MustGet("dto").(*request.CreateCategoryRequest)

	modelCat := mapper.CreateCategoryToModel(req, user.ID, storeID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := category_repository.SaveCategory(conn, modelCat); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "could not save"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToCategoryResponse(modelCat))
}

// UpdateCategory godoc
// @Summary      Update a category
// @Description  Updates a category for the authenticated user
// @Security     BearerAuth
// @Tags         Category
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string                           true  "Store ID"
// @Param        data        body      request.UpdateCategoryRequest    true  "Category update payload"
// @Success      200         {object}  response.CategoryResponse
// @Failure      400         {object}  response.ErrorResponse "Bad request or invalid data"
// @Failure      401         {object}  response.ErrorResponse "Unauthorized"
// @Failure      500         {object}  response.ErrorResponse "Internal server error"
// @Router       /items/categories [put]
func UpdateCategory(c *gin.Context) {
	logger.Log.Info("UpdateCategory")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	// pulled from middleware
	cat := c.MustGet("dto").(*request.UpdateCategoryRequest)
	catModel := mapper.UpdateCategoryToModel(cat, user.ID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	updatedCategory, err := category_repository.UpdateCategory(conn, user.ID, catModel)

	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "could not update"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToCategoryResponse(updatedCategory))
}

// DeleteCategory godoc
// @Summary      Delete a category
// @Description  Deletes a category by ID. Returns 409 if the category is still referenced by other entities.
// @Security     BearerAuth
// @Tags         Category
// @Accept       json
// @Produce      json
// @Param        id          path      int     true  "Category ID"
// @Param        X-Store-ID  header    string  true  "Store ID"
// @Success      204  "Category deleted successfully"
// @Failure      400  {object}  response.ErrorResponse                           "Invalid ID"
// @Failure      401  {object}  response.ErrorResponse                           "Unauthorized"
// @Failure      409  {object}  response.ForeignKeyDeleteReferencedErrorResponse      "Referenced by other entities"
// @Failure      500  {object}  response.ErrorResponse                           "Internal server error"
// @Router       /items/categories/{id} [delete]
func DeleteCategory(c *gin.Context) {
	logger.Log.Info("DeleteCategory")
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		logger.Log.Error("Error invalid id: ", err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "invalid id"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := category_repository.DeleteCategory(conn, uint(id)); err != nil {
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
