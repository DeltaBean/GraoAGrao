package middleware

import (
	"net/http"
	"strings"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
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
			logger.Log.Warnf("Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
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
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// 2) validate
		if err := validator.Validate.Struct(dto); err != nil {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"validation_error": err.Error()})
			c.Abort()
			return
		}

		// 3) stash for handler
		c.Set("dto", dto)
		c.Next()
	}
}
