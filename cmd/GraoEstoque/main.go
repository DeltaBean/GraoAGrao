package main

import (
	"os"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"github.com/gin-contrib/cors"

	routes "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/routes"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"

	"github.com/gin-gonic/gin"
)

// @title Grão a Grão API
// @version 1.0
// @description This is the API documentation for Grão a Grão
// @host localhost:8080
// @BasePath /
func main() {

	// Initializes db
	db.InitDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback
	}

	frontendURL := os.Getenv("FRONTEND_URL")

	logger.Log.Info("Starting API server")

	// Run shutdown signal handling in a separate goroutine
	// for clean shutdown
	go util.WaitForShutdown()

	// Start the TryOut cron worker in a separate goroutine
	// to handle background scheduled try out environment tasks.
	util.StartTryOutCronWorker()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "X-Store-ID"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, // Browser can cache this config for 12 hours
	}))

	// Initialize routes from the router package
	routes.InitRoutes(router)
	logger.Log.Info("Routes successfully initialized.")

	router.Run("0.0.0.0:" + port)
	logger.Log.Infof("API server listening on port %s", port)
}
