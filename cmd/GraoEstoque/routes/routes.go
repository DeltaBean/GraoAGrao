package routes

import (
	handler "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler"
	middleware "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/middleware"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/gin-gonic/gin"
)

// InitRoutes initializes the API routes
func InitRoutes(router *gin.Engine) {
	// Health endpoint
	router.GET("/health", handler.HealthHandler)

	// Authentication endpoints
	authRoutes := router.Group("/auth")
	{
		authRoutes.GET("/google", handler.GoogleAuthHandler)
		authRoutes.GET("/google/callback", handler.GoogleAuthCallBackHandler)
	}

	// Items endpoints
	itemGroup := router.Group("/items")
	itemGroup.Use(middleware.AuthMiddleware()) // Apply authentication middleware
	{
		itemGroup.GET("", handler.GetItems)
		itemGroup.GET("/:id", handler.GetItemByID)
		itemGroup.DELETE("/:id", handler.DeleteItem)

		itemGroup.POST("",
			middleware.BindAndValidateMiddleware[dtoRequest.CreateItemRequest](),
			handler.CreateItem,
		)

		itemGroup.PUT("", middleware.BindAndValidateMiddleware[dtoRequest.UpdateItemRequest](),
			handler.UpdateItem,
		)

		// Category endpoints
		categoryGroup := itemGroup.Group("/categories")
		{
			categoryGroup.GET("", handler.GetCategories)
			categoryGroup.GET("/:id", handler.GetCategoryByID)
			categoryGroup.DELETE("/:id", handler.DeleteCategory)

			categoryGroup.POST("", middleware.BindAndValidateMiddleware[dtoRequest.CreateCategoryRequest](),
				handler.CreateCategory,
			)
			categoryGroup.PUT("",
				middleware.BindAndValidateMiddleware[dtoRequest.UpdateCategoryRequest](),
				handler.UpdateCategory,
			)
		}

		// Unit endpoints
		unitGroup := itemGroup.Group("/units")
		{
			unitGroup.GET("", handler.ListUnits)
			unitGroup.GET("/:id", handler.GetUnitByID)
			unitGroup.DELETE("/:id", handler.DeleteUnit)

			unitGroup.POST("", middleware.BindAndValidateMiddleware[dtoRequest.CreateUnitOfMeasureRequest](),
				handler.CreateUnit,
			)
			unitGroup.PUT("", middleware.BindAndValidateMiddleware[dtoRequest.UpdateUnitOfMeasureRequest](),
				handler.UpdateUnit,
			)
		}
	}

	stockGroup := router.Group("/stock")
	stockGroup.Use(middleware.AuthMiddleware()) // Apply authentication middleware
	{

		// Get stock materialized snapshot
		stockGroup.GET("", handler.GetStock)
		stockGroup.GET("/:categoryId", handler.GetStockByCategory)

		// StockIn endpoints
		stockInGroup := stockGroup.Group("/in")
		{
			stockInGroup.GET("", handler.ListAllStockIn)
			stockInGroup.GET("/:id", handler.GetStockInByID)
			stockInGroup.POST("", handler.CreateStockIn)
			stockInGroup.DELETE("/:id", handler.DeleteStockIn)
		}

		// StockOut endpoints
		stockOutGroup := stockGroup.Group("/out")
		{
			stockOutGroup.GET("", handler.ListAllStockOut)
			stockOutGroup.GET("/:id", handler.GetStockOutByID)
			stockOutGroup.POST("", handler.CreateStockOut)
			stockOutGroup.DELETE("/:id", handler.DeleteStockOut)
		}

		// StockPackaging endpoints
		stockPackagingGroup := stockGroup.Group("/packaging")
		{
			stockPackagingGroup.GET("", handler.ListStockPackagings)
			stockPackagingGroup.GET("/:id", handler.GetStockPackagingByID)
			stockPackagingGroup.DELETE("/:id", handler.DeleteStockPackaging)

			stockPackagingGroup.POST("", middleware.BindAndValidateMiddleware[dtoRequest.CreateStockPackagingRequest](),
				handler.CreateStockPackaging,
			)
			stockPackagingGroup.PUT("", middleware.BindAndValidateMiddleware[dtoRequest.UpdateStockPackagingRequest](),
				handler.UpdateStockPackaging,
			)
		}
	}
}
