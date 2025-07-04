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
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/item_packaging_service"
	"github.com/gin-gonic/gin"
)

// CreateItemPackaging godoc
// @Summary      Create a new item packaging
// @Description  Creates a new packaging configuration for an item
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                          true  "Store ID"
// @Param        data        body    request.CreateItemPackagingRequest  true  "Item packaging creation payload"
// @Success      201  {object}  response.ItemPackagingResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid input or store ID"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging [post]
func CreateItemPackaging(c *gin.Context) {
	logger.Log.Info("CreateItemPackaging")

	req := c.MustGet("dto").(*request.CreateItemPackagingRequest)

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

	modelPackaging := mapper.CreateItemPackagingToModel(req, user.ID, storeID)
	err = item_packaging_service.CreateItemPackaging(conn, modelPackaging, storeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error saving packaging"})
		return
	}

	c.JSON(http.StatusCreated, mapper.ToItemPackagingResponse(modelPackaging))
}

// GetItemPackagingByID godoc
// @Summary      Get item packaging by ID
// @Description  Retrieves a specific item packaging configuration by ID
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Item packaging ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  response.ItemPackagingResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid ID"
// @Failure      404  {object}  response.ErrorResponse "Packaging not found"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging/{id} [get]
func GetItemPackagingByID(c *gin.Context) {
	logger.Log.Info("GetItemPackagingByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	packaging, err := item_packaging_repository.GetItemPackagingByID(conn, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error retrieving packaging"})
		return
	}
	if packaging == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Error: "Packaging not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemPackagingResponse(packaging))
}

// ListItemPackagings godoc
// @Summary      List item packagings
// @Description  Retrieves a paginated list of item packaging configurations
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header    string  true   "Store ID"
// @Param        offset      query     int     false  "Pagination offset"
// @Param        limit       query     int     false  "Pagination limit"
// @Success      200  {array}  response.ItemPackagingResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid store ID"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging [get]
func ListItemPackagings(c *gin.Context) {
	logger.Log.Info("ListItemPackagings")

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
	packagings, err := item_packaging_repository.ListItemPackagingsPaginated(conn, user.ID, storeID, uint(offset), uint(limit))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error listing packagings"})
		return
	}

	resp := make([]response.ItemPackagingResponse, len(packagings))
	for i, p := range packagings {
		resp[i] = mapper.ToItemPackagingResponse(&p)
	}

	c.JSON(http.StatusOK, resp)
}

// UpdateItemPackaging godoc
// @Summary      Update an item packaging
// @Description  Updates an existing item packaging configuration
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        X-Store-ID  header  string                          true  "Store ID"
// @Param        data        body    request.UpdateItemPackagingRequest  true  "Item packaging update payload"
// @Success      200  {object}  response.ItemPackagingResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid input"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging [put]
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
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error updating packaging"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemPackagingResponse(updated))
}

// DeleteItemPackaging godoc
// @Summary      Delete item packaging
// @Description  Deletes an item packaging by its ID
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Item packaging ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      204  "Item packaging deleted successfully"
// @Failure      400  {object}  response.ErrorResponse "Invalid ID"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging/{id} [delete]
func DeleteItemPackaging(c *gin.Context) {
	logger.Log.Info("DeleteItemPackaging")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	if err := item_packaging_repository.DeleteItemPackaging(conn, uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error deleting packaging"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetItemPackagingLabelPreviewByID godoc
// @Summary      Get item packaging label preview
// @Description  Gets a item packaging url label preview by ID
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        id          path    int     true  "Item packaging ID"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  response.LabelPreviewResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid ID"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging/stockLabel/preview/{id} [get]
func GetItemPackagingLabelPreviewByID(c *gin.Context) {
	logger.Log.Info("GetItemPackagingLabelPreviewByID")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ID"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	url, err := item_packaging_service.GetLabelPreviewByID(conn, uint(id))
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error fetching label preview"})
		return
	}

	c.JSON(http.StatusOK, response.LabelPreviewResponse{URL: url})
}

// GetItemPackagingLabelPDFBatch godoc
// @Summary      Generate a batch PDF of item packaging labels
// @Description  Receives a list of item packaging IDs and quantities to print labels in bulk
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      application/pdf
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Param        data        body    []request.LabelBatchRequest  true  "List of packaging IDs and quantities"
// @Success      200  {file}  application/pdf
// @Failure      400  {object}  response.ErrorResponse "Invalid input"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging/stockLabel/batch [post]
func GetItemPackagingLabelPDFBatch(c *gin.Context) {
	logger.Log.Info("GetItemPackagingLabelPDFBatch")

	var batchReq []request.LabelBatchRequest
	if err := c.ShouldBindJSON(&batchReq); err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid request body"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	pdfData, err := item_packaging_service.GenerateBatchLabelPDF(conn, batchReq)
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Failed to generate labels"})
		return
	}

	c.Data(http.StatusOK, "application/pdf", pdfData)
}

// GetItemPackagingByEAN8 godoc
// @Summary      Get item packaging by EAN 8 code
// @Description  Retrieves a specific item packaging configuration by EAN 8 code
// @Security     BearerAuth
// @Tags         Item Packaging
// @Accept       json
// @Produce      json
// @Param        ean8        path    int     true  "Item packaging EAN 8"
// @Param        X-Store-ID  header  string  true  "Store ID"
// @Success      200  {object}  response.ItemPackagingResponse
// @Failure      400  {object}  response.ErrorResponse "Invalid ean8 code"
// @Failure      404  {object}  response.ErrorResponse "Packaging not found"
// @Failure      500  {object}  response.ErrorResponse "Internal server error"
// @Router       /items/packaging/scan/{ean8} [get]
func GetItemPackagingByEAN8(c *gin.Context) {
	logger.Log.Info("GetItemPackagingByEAN8")

	ean8 := c.Param("ean8")
	if ean8 == "" || len(ean8) != 8 {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Error: "Invalid ean8 code"})
		return
	}

	conn := util.GetDBConnFromContext(c)
	if conn == nil {
		return
	}

	packaging, err := item_packaging_repository.GetItemPackagingByEAN8(conn, ean8)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error retrieving packaging"})
		return
	}
	if packaging == nil {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Error: "Packaging not found"})
		return
	}

	c.JSON(http.StatusOK, mapper.ToItemPackagingResponse(packaging))
}
