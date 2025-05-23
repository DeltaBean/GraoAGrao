package middleware

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"

	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/IlfGauhnith/GraoAGrao/pkg/validator"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks for a valid JWT token in the Authorization header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header.
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logger.Log.Warn("Missing Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		// Extract the token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			logger.Log.Warn("Bearer token not found in header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		// Validate the JWT token.
		token, err := util.ValidateJWT(tokenString)
		if err != nil || !token.Valid {
			logger.Log.Errorf("Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract user information from the token.
		user, err := util.GetUserFromJWT(*token)
		if err != nil {
			logger.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to extract user from jwt"})
			c.Abort()
			return
		}

		if user == nil {
			logger.Log.Error("User not found")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			c.Abort()
			return
		}

		// Store the user information in the context for later use.
		// This can be used in subsequent handlers to access the authenticated user.
		// For example, you can use c.Get("authenticated") in your handlers.
		c.Set("authenticated", user)

		expTime, err := util.GetTryOutExpirationFromJWT(*token)
		if err != nil {
			// If claim is present but malformed, treat as an error
			logger.Log.Error("Invalid tryout_expires_at in JWT:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid tryout_expires_at claim"})
			c.Abort()
			return
		}

		if !expTime.IsZero() {
			c.Set("tryout_expires_at", expTime)
		}

		// Proceed to the next middleware or handler
		c.Next()
	}
}

// BindAndValidate[T] will:
// 1) bind JSON → *T
// 2) run validator.Validate.Struct on it
// 3) abort with 400/422 if anything fails
// 4) otherwise put the *T into context under "dto"
func BindAndValidateMiddleware[T any]() gin.HandlerFunc {
	return func(c *gin.Context) {
		dto := new(T)

		// 1) bind
		if err := c.ShouldBindJSON(dto); err != nil {
			logger.Log.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// 2) validate
		if err := validator.Validate.Struct(dto); err != nil {
			logger.Log.Error(err)
			c.JSON(http.StatusUnprocessableEntity, gin.H{"validation_error": err.Error()})
			c.Abort()
			return
		}

		// 3) stash for handler
		c.Set("dto", dto)
		c.Next()
	}
}

func TenantMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1) Get the rawUser from the context
		rawUser, exists := c.Get("authenticated")
		if !exists {
			logger.Log.Error("User not found at context")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			c.Abort()
			return
		}

		// 2) Assert the type of user
		// Assuming user is of type *model.User
		userModel, ok := rawUser.(*model.User)
		if !ok {
			logger.Log.Error("User type assertion failed")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user type assertion failed"})
			c.Abort()
			return
		}

		DBSchema := userModel.Organization.DBSchema

		// Validate schema name, allowing letters, digits, underscores and hyphens (but must start with letter or underscore)
		validSchema := regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_-]*$`)
		if !validSchema.MatchString(DBSchema) {
			logger.Log.Error("invalid schema name")
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid schema name"})
			c.Abort()
			return
		}
		// 3) Acquire a conn
		conn, err := db.GetDB().Acquire(c)
		if err != nil {
			logger.Log.Error(err)
			c.Status(500)
			c.Abort()
			return
		}
		// Ensure the connection is released after use
		// This is important to prevent connection leaks.
		// Runs after the handler completes.
		defer conn.Release()

		// 4) Set the search_path to the user's organization schema
		// This is important for multi-tenancy, as it allows you to use the same database
		// for multiple organizations, each with its own schema.
		// This way, you can ensure that each organization only has access to its own data.
		schemaQuery := fmt.Sprintf("SET search_path TO \"%s\", public", DBSchema)
		_, err = conn.Exec(context.Background(), schemaQuery)
		if err != nil {
			logger.Log.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to set organization schema"})
			c.Abort()
			return
		}

		// 5) store conn in context for downstream use
		// You can access it using c.MustGet("dbConn") in your handlers.
		// This is useful for executing queries within the context of the user's organization schema.
		c.Set("dbConn", conn)
		c.Next()
	}
}

func StoreMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := c.GetHeader("X-Store-ID")
		if raw == "" {
			logger.Log.Fatal("X-Store-ID header missing")
			c.JSON(http.StatusBadRequest, gin.H{"error": "X-Store-ID header missing"})
			c.Abort()
			return
		}

		storeID, err := strconv.Atoi(raw)
		if err != nil {
			logger.Log.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid store id"})
			c.Abort()
			return
		}

		c.Set("storeID", uint(storeID))
		c.Next()
	}
}

func TenantAccessGuard() gin.HandlerFunc {
	return func(c *gin.Context) {
		expRaw, exists := c.Get("tryout_expires_at")
		if !exists {
			c.Next() // Not a tryout user
			return
		}

		expTime, ok := expRaw.(time.Time)
		if !ok {
			logger.Log.Warn("Invalid tryout_expires_at type in context")
			c.Next()
			return
		}

		if time.Now().After(expTime) {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "trial_expired",
				"message": "Your free trial has expired. Please subscribe or delete your environment.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
