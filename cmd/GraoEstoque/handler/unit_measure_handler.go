package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	data_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
)

func CreateUnit(c *gin.Context) {
	logger.Log.Info("CreateUnitOfMeasure")

	var unit model.UnitOfMeasure
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = data_handler.SaveUnitOfMeasure(&unit, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving unit"})
		return
	}

	c.JSON(http.StatusCreated, unit)
}

func GetUnitByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	unit, err := data_handler.GetUnitOfMeasureByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving unit"})
		return
	}
	if unit == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Unit not found"})
		return
	}

	c.JSON(http.StatusOK, unit)
}

func ListUnits(c *gin.Context) {
	user, err := util.GetUserFromJWT(c.Request.Header["Authorization"][0])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	units, err := data_handler.ListUnitsPaginated(user.ID, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error listing units"})
		return
	}

	c.JSON(http.StatusOK, units)
}

func UpdateUnit(c *gin.Context) {
	var unit model.UnitOfMeasure
	if err := c.ShouldBindJSON(&unit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := data_handler.UpdateUnitOfMeasure(&unit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating unit"})
		return
	}

	c.JSON(http.StatusOK, unit)
}

func DeleteUnit(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	err = data_handler.DeleteUnitOfMeasure(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting unit"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unit deleted"})
}
