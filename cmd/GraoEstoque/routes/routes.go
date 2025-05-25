package routes

import (
	handler "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler"
	middleware "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/middleware"
	dtoRequest "github.com/IlfGauhnith/GraoAGrao/pkg/dto/request"
	"github.com/gin-gonic/gin"
)

// InitRoutes initializes the API routes
func InitRoutes(router *gin.Engine) {

	// Support browser preflight OPTIONS requests explicitly
	// Ensures the browser receives the appropriate headers even on preflight requests
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.AbortWithStatus(204)
	})

	// Health endpoint
	router.GET("/health", handler.HealthHandler)

	// Authentication endpoints
	authGroup := router.Group("/auth")
	{
		authGroup.GET("/google", handler.GoogleAuthHandler)
		authGroup.GET("/google/callback", handler.GoogleAuthCallBackHandler)
	}

	tryOutGroup := router.Group("/tryOut")
	tryOutGroup.Use()
	{
		tryOutGroup.GET("/status", handler.GetTryOutJobStatus)
		tryOutGroup.DELETE(
			"/destroyEnv",
			middleware.AuthMiddleware(), // Needed to destroy user specific env
			handler.DestroyTryOutEnvironment,
		)
	}

	// Store endpoints
	storeGroup := router.Group("/stores")
	storeGroup.Use(
		middleware.AuthMiddleware(),
		middleware.TenantMiddleware(),
		middleware.TenantAccessGuard(),
	)
	{
		storeGroup.GET("", handler.GetStores)
		storeGroup.GET("/:id", handler.GetStoreByID)
		storeGroup.DELETE("/:id", handler.DeleteStore)
		storeGroup.POST("",
			middleware.BindAndValidateMiddleware[dtoRequest.CreateStoreRequest](),
			handler.CreateStore,
		)
		storeGroup.PUT("",
			middleware.BindAndValidateMiddleware[dtoRequest.UpdateStoreRequest](),
			handler.UpdateStore,
		)
	}

	// Items endpoints
	itemGroup := router.Group("/items")
	itemGroup.Use(
		middleware.AuthMiddleware(),
		middleware.TenantMiddleware(),
		middleware.TenantAccessGuard(),
		middleware.StoreMiddleware(),
	)
	{
		itemGroup.GET("", handler.GetItems)
		itemGroup.GET("/:id", handler.GetItemByID)
		itemGroup.DELETE("/:id", handler.DeleteItem)

		itemGroup.POST("",
			middleware.BindAndValidateMiddleware[dtoRequest.CreateItemRequest](),
			handler.CreateItem,
		)

		itemGroup.PUT("",
			middleware.BindAndValidateMiddleware[dtoRequest.UpdateItemRequest](),
			handler.UpdateItem,
		)

		// Category endpoints
		categoryGroup := itemGroup.Group("/categories")
		{
			categoryGroup.GET("", handler.GetCategories)
			categoryGroup.GET("/:id", handler.GetCategoryByID)
			categoryGroup.DELETE("/:id", handler.DeleteCategory)

			categoryGroup.POST("",
				middleware.BindAndValidateMiddleware[dtoRequest.CreateCategoryRequest](),
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

			unitGroup.POST("",
				middleware.BindAndValidateMiddleware[dtoRequest.CreateUnitOfMeasureRequest](),
				handler.CreateUnit,
			)
			unitGroup.PUT("",
				middleware.BindAndValidateMiddleware[dtoRequest.UpdateUnitOfMeasureRequest](),
				handler.UpdateUnit,
			)
		}

		// ItemPackaging endpoints
		itemPackagingGroup := itemGroup.Group("/packaging")
		{
			itemPackagingGroup.GET("", handler.ListItemPackagings)
			itemPackagingGroup.GET("/:id", handler.GetItemPackagingByID)
			itemPackagingGroup.DELETE("/:id", handler.DeleteItemPackaging)

			itemPackagingGroup.POST("",
				middleware.BindAndValidateMiddleware[dtoRequest.CreateItemPackagingRequest](),
				handler.CreateItemPackaging,
			)
			itemPackagingGroup.PUT("",
				middleware.BindAndValidateMiddleware[dtoRequest.UpdateItemPackagingRequest](),
				handler.UpdateItemPackaging,
			)
		}
	}

	stockGroup := router.Group("/stock")
	stockGroup.Use(
		middleware.AuthMiddleware(),
		middleware.TenantMiddleware(),
		middleware.TenantAccessGuard(),
		middleware.StoreMiddleware(),
	)
	{

		// Get stock materialized snapshot
		stockGroup.GET("", handler.GetStock)
		stockGroup.GET("/:categoryId", handler.GetStockByCategory)

		// StockIn endpoints
		stockInGroup := stockGroup.Group("/in")
		{
			stockInGroup.GET("", handler.ListAllStockIn)
			stockInGroup.GET("/:id", handler.GetStockInByID)
			stockInGroup.POST("",
				middleware.BindAndValidateMiddleware[dtoRequest.CreateStockInRequest](),
				handler.CreateStockIn,
			)
			stockInGroup.PUT("",
				middleware.BindAndValidateMiddleware[dtoRequest.UpdateStockInRequest](),
				handler.UpdateStockIn,
			)
			stockInGroup.PATCH("/finalize/:id", handler.FinalizeStockInByID)
			stockInGroup.DELETE("/:id", handler.DeleteStockIn)
		}

		// StockOut endpoints
		stockOutGroup := stockGroup.Group("/out")
		{
			stockOutGroup.GET("", handler.ListAllStockOut)
			stockOutGroup.GET("/:id", handler.GetStockOutByID)
			stockOutGroup.POST("",
				middleware.BindAndValidateMiddleware[dtoRequest.CreateStockOutRequest](),
				handler.CreateStockOut,
			)
			stockOutGroup.PUT("",
				middleware.BindAndValidateMiddleware[dtoRequest.UpdateStockOutRequest](),
				handler.UpdateStockOut,
			)
			stockOutGroup.PATCH("/finalize/:id", handler.FinalizeStockOutByID)
			stockOutGroup.DELETE("/:id", handler.DeleteStockOut)
		}
	}
}
