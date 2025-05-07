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

	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/unit_of_measure_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/error_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
)

// ListUnits returns paginated units for the auth'd user
func ListUnits(c *gin.Context) {
	logger.Log.Info("ListUnits")
	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	offset, _ := strconv.ParseUint(c.DefaultQuery("offset", "0"), 10, 0)
	limit, _ := strconv.ParseUint(c.DefaultQuery("limit", "20"), 10, 0)

	models, err := unit_of_measure_repository.ListUnitsPaginated(user.ID, offset, limit)
	if err != nil {
		logger.Log.Error("Error listing units: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing units"})
		return
	}

	resp := make([]response.UnitOfMeasureResponse, len(models))
	for i, m := range models {
		resp[i] = mapper.ToUnitOfMeasureResponse(&m)
	}

	c.JSON(http.StatusOK, resp)
}

// GetUnitByID returns a single unit by its ID
func GetUnitByID(c *gin.Context) {
	logger.Log.Info("GetUnitByID")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	modelUnit, err := unit_of_measure_repository.GetUnitOfMeasureByID(uint(id))
	if err != nil {
		logger.Log.Error("Error retrieving unit: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving unit"})
		return
	}
	if modelUnit == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Unit not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToUnitOfMeasureResponse(modelUnit))
}

// CreateUnit creates a new unit-of-measure
func CreateUnit(c *gin.Context) {
	logger.Log.Info("CreateUnitOfMeasure")

	req := c.MustGet("dto").(*request.CreateUnitOfMeasureRequest)

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	modelUnit := mapper.CreateUnitOfMeasureToModel(req, user.ID)
	if err := unit_of_measure_repository.SaveUnitOfMeasure(modelUnit, user.ID); err != nil {
		logger.Log.Error("Error saving unit: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving unit"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToUnitOfMeasureResponse(modelUnit))
}

// UpdateUnit updates an existing unit-of-measure
func UpdateUnit(c *gin.Context) {
	logger.Log.Info("UpdateUnitOfMeasure")

	user, err := util.GetUserFromJWT(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	req := c.MustGet("dto").(*request.UpdateUnitOfMeasureRequest)
	unitModel := mapper.UpdateUnitOfMeasureToModel(req, user.ID)

	updated, err := unit_of_measure_repository.UpdateUnitOfMeasure(unitModel)

	if err != nil {
		logger.Log.Error("Error updating unit: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating unit"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToUnitOfMeasureResponse(updated))
}

// DeleteUnit deletes a unit-of-measure by its ID
func DeleteUnit(c *gin.Context) {
	logger.Log.Info("DeleteUnitOfMeasure")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := unit_of_measure_repository.DeleteUnitOfMeasure(uint(id)); err != nil {
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
