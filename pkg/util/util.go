package util

import (
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_job_repository"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/tryout_service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

func GetStage() string {
	stage := os.Getenv("STAGE")

	if stage == "" {
		stage = "PROD"
	}

	return stage
}

func WaitForShutdown() {
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	// Block until a signal is received
	sig := <-shutdown
	logger.Log.Infof("Received signal: %s, shutting down...", sig)

	// Perform DB cleanup
	db.CloseDB()

	logger.Log.Infof("Cleanup completed, exiting...")
	os.Exit(0)
}

// NewUserFromGoogleUserInfo transforms a GoogleUserInfo into a User model.
// It sets the AuthProvider to "google", uses the current time for timestamps,
// and derives a username if one is not provided by using the email's local part.
func NewUserFromGoogleUserInfo(googleUser model.GoogleUserInfo) *model.User {
	now := time.Now()

	return &model.User{
		Username:     "",
		Email:        googleUser.Email,
		GoogleID:     googleUser.ID,
		GivenName:    googleUser.GivenName,
		FamilyName:   googleUser.FamilyName,
		PictureURL:   googleUser.Picture,
		AuthProvider: "google",
		UpdatedAt:    now,
		LastLogin:    now,
		IsActive:     true,
		// PasswordHash and Salt remain empty because this user signed in with Google.
	}
}

// GetDBConnFromContext safely retrieves *pgxpool.Conn from gin.Context
func GetDBConnFromContext(c *gin.Context) *pgxpool.Conn {
	dbConn, exists := c.Get("dbConn")
	if !exists {
		logger.Log.Error("Database connection not found in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		c.Abort()
		return nil
	}

	conn, ok := dbConn.(*pgxpool.Conn)
	if !ok {
		logger.Log.Error("Invalid dbConn type in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		c.Abort()
		return nil
	}

	return conn
}

func StartTryOutCronWorker() {
	c := cron.New()

	// Run every 30 seconds
	// Process tryout environment creation jobs
	c.AddFunc("@every 30s", func() {
		jobs, err := tryout_job_repository.ListTryOutJobByStatus("pending")
		if err != nil {
			logger.Log.Error("Failed to list pending demo jobs:", err)
			return
		}
		for _, job := range jobs {
			err = tryout_service.ProcessTryOutEnvironmentJob(&job)
			if err != nil {
				logger.Log.Error(err)
			}
		}
	})

	// Run every 1 hour
	// Process tryout environment expiration jobs
	c.AddFunc("@every 1h", func() {
		jobs, err := tryout_job_repository.ListTryOutJobByStatus("completed")
		if err != nil {
			logger.Log.Error("Failed to list completed demo jobs:", err)
			return
		}
		for _, job := range jobs {
			err = tryout_service.ExpireTryOutJob(&job)
			if err != nil {
				logger.Log.Error(err)
			}
		}
	})
	c.Start()
}
