package routes

import (
	handler "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler"
	"github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/middleware"
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
		itemGroup.POST("", handler.CreateItem)
		itemGroup.PUT("", handler.UpdateItem)
		itemGroup.DELETE("/:id", handler.DeleteItem)

		// Category endpoints
		categoryGroup := itemGroup.Group("/categories")
		{
			categoryGroup.GET("", handler.GetCategories)
			categoryGroup.GET("/:id", handler.GetCategoryByID)
			categoryGroup.POST("", handler.CreateCategory)
			categoryGroup.PUT("", handler.UpdateCategory)
			categoryGroup.DELETE("/:id", handler.DeleteCategory)
		}
	}

	// StockIn endpoints
	stockInGroup := router.Group("/stock_in")
	stockInGroup.Use(middleware.AuthMiddleware()) // Apply authentication middleware
	{
		stockInGroup.GET("", handler.ListAllStockIn)
		stockInGroup.GET("/:id", handler.GetStockInByID)
		stockInGroup.POST("", handler.CreateStockIn)
		stockInGroup.DELETE("/:id", handler.DeleteStockIn)
	}

	// StockOut endpoints
	stockOutGroup := router.Group("/stock_out")
	stockOutGroup.Use(middleware.AuthMiddleware()) // Apply authentication middleware
	{
		stockOutGroup.GET("", handler.ListAllStockOut)
		stockOutGroup.GET("/:id", handler.GetStockOutByID)
		stockOutGroup.POST("", handler.CreateStockOut)
		stockOutGroup.DELETE("/:id", handler.DeleteStockOut)
	}
}
