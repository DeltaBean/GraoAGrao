package routes

import (
	handler "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler"
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
	{
		itemGroup.GET("", handler.GetItems)
		itemGroup.GET("/:id", handler.GetItemByID)
		itemGroup.POST("", handler.CreateItem)
		itemGroup.PUT("", handler.UpdateItem)
		itemGroup.DELETE("/:id", handler.DeleteItem)
	}
}
