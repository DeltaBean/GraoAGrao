package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/mapper"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/unit_of_measure_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
)

// ListUnits godoc
// @Summary      List units of measure
// @Description  Retrieves a paginated list of units of measure for the authenticated user and store
// @Security     BearerAuth
// @Tags         Unit Of Measure
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string  true   "Store ID"
// @Param        offset      query     int     false  "Pagination offset"
// @Param        limit       query     int     false  "Pagination limit"
// @Success      200  {array}  response.UnitOfMeasureResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid or missing store ID"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/units [get]
func ListUnits(c *gin.Context) {
	logger.Log.Info("ListUnits")

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

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	models, err := unit_of_measure_repository.ListUnitsPaginated(conn, user.ID, storeID, uint(offset), uint(limit))
	if err != nil {
		logger.Log.Error("Error listing units: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error listing units"})
		return
	}

	resp := make([]response.UnitOfMeasureResponse, len(models))
	for i, m := range models {
		resp[i] = mapper.ToUnitOfMeasureResponse(&m)
	}

	c.JSON(http.StatusOK, resp)
}

// GetUnitByID godoc
// @Summary      Get unit of measure by ID
// @Description  Retrieves a specific unit of measure by its ID
// @Security     BearerAuth
// @Tags         Unit Of Measure
// @Accept       json
// @Produce      json
// @Param        id          path     int     true  "Unit ID"
// @Param        X-Store-ID  header   string  true  "Store ID"
// @Success      200  {object}  response.UnitOfMeasureResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid ID"
// @Failure      404  {object}  response.ErrorResponse "Unit not found"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/units/{id} [get]
func GetUnitByID(c *gin.Context) {
	logger.Log.Info("GetUnitByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	modelUnit, err := unit_of_measure_repository.GetUnitOfMeasureByID(conn, uint(id))
	if err != nil {
		logger.Log.Error("Error retrieving unit: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error retrieving unit"})
		return
	}
	if modelUnit == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Error: "Unit not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToUnitOfMeasureResponse(modelUnit))
}

// CreateUnit godoc
// @Summary      Create a unit of measure
// @Description  Creates a new unit of measure for the authenticated user and store
// @Security     BearerAuth
// @Tags         Unit Of Measure
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                             true  "Store ID"
// @Param        data        body    request.CreateUnitOfMeasureRequest  true  "Unit of measure creation payload"
// @Success      201  {object}  response.UnitOfMeasureResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid input or store ID"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/units [post]
func CreateUnit(c *gin.Context) {
	logger.Log.Info("CreateUnitOfMeasure")

	req := c.MustGet("dto").(*request.CreateUnitOfMeasureRequest)

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

	modelUnit := mapper.CreateUnitOfMeasureToModel(req, user.ID, storeID)
	if err := unit_of_measure_repository.SaveUnitOfMeasure(conn, modelUnit); err != nil {
		logger.Log.Error("Error saving unit: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error saving unit"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToUnitOfMeasureResponse(modelUnit))
}

// UpdateUnit godoc
// @Summary      Update a unit of measure
// @Description  Updates an existing unit of measure
// @Security     BearerAuth
// @Tags         Unit Of Measure
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                             true  "Store ID"
// @Param        data        body    request.UpdateUnitOfMeasureRequest  true  "Unit of measure update payload"
// @Success      200  {object}  response.UnitOfMeasureResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid input"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/units [put]
func UpdateUnit(c *gin.Context) {
	logger.Log.Info("UpdateUnitOfMeasure")

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

	req := c.MustGet("dto").(*request.UpdateUnitOfMeasureRequest)
	unitModel := mapper.UpdateUnitOfMeasureToModel(req, user.ID)

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	updated, err := unit_of_measure_repository.UpdateUnitOfMeasure(conn, unitModel)

	if err != nil {
		logger.Log.Error("Error updating unit: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error updating unit"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToUnitOfMeasureResponse(updated))
}

// DeleteUnit godoc
// @Summary      Delete a unit of measure
// @Description  Deletes a unit of measure by its ID. Returns 409 if the unit is still referenced by items.
// @Security     BearerAuth
// @Tags         Unit Of Measure
// @Accept       json
// @Produce      json
// @Param        id          path     int     true  "Unit ID"
// @Param        X-Store-ID  header   string  true  "Store ID"
// @Success      204  "Unit of measure deleted successfully"
// @Failure      400  {object}  response.ErrorResponse "Invalid ID"
// @Failure      409  {object}  response.ForeignKeyDeleteReferencedErrorResponse "Unit is still referenced by other records"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/units/{id} [delete]
func DeleteUnit(c *gin.Context) {
	logger.Log.Info("DeleteUnitOfMeasure")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := unit_of_measure_repository.DeleteUnitOfMeasure(conn, uint(id)); err != nil {
		logger.Log.Error("Error deleting unit: ", err)
		error_handler.HandleDBErrorWithReferencingFetcher(c,
			err,
			uint(id),
			unit_of_measure_repository.GetReferencingItems,
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
