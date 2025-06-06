package util

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/gin-gonic/gin"

	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

// GenerateSalt generates a random salt value for password hashing.
func GenerateSalt(length int) (string, error) {
	salt := make([]byte, length)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(salt), nil
}

// HashPassword hashes a password with a given salt.
func HashPassword(password, salt string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password+salt), bcrypt.DefaultCost)
	return string(hashed), err
}

// GenerateOAuthState generates a random string to use as the OAuth state.
// The 'length' parameter specifies how many random bytes to generate.
func GenerateOAuthState(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate random state: %v", err)
	}
	// Encode the random bytes into a URL-safe string.
	return base64.URLEncoding.EncodeToString(bytes), nil
}

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateJWT(user model.User) (string, error) {
	claims := buildCommonClaims(user)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		logger.Log.Errorf("Error signing regular JWT token: %v", err)
		return "", err
	}

	logger.Log.Infof("JWT token generated for regular user %d", user.ID)
	return tokenString, nil
}

func GenerateTryOutJWT(user model.User, tryOutExpiresAt time.Time) (string, error) {
	claims := buildCommonClaims(user)
	claims["tryout_expires_at"] = tryOutExpiresAt.Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		logger.Log.Errorf("Error signing tryout JWT token: %v", err)
		return "", err
	}

	logger.Log.Infof("JWT token generated for tryout user %d", user.ID)
	return tokenString, nil
}

// ValidateJWT verifies and parses the given JWT token
func ValidateJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is correct
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		logger.Log.Errorf("Error validating JWT token: %v", err)
		return nil, err
	}

	return token, nil
}

// GetUserFromJWT extracts the token from the Authorization header,
// parses it, and returns a pointer to a model.User containing the data
// stored in the token's claims.
func GetUserFromJWT(token jwt.Token) (*model.User, error) {
	// Validate and extract claims.
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		user := &model.User{}

		// Extract user_id (stored as a number, so we cast to float64 then to int)
		if idFloat, ok := claims["user_id"].(float64); ok {
			user.ID = uint(idFloat)
		} else {
			return nil, errors.New("user_id not found in token")
		}

		// Extract user_email
		if email, ok := claims["user_email"].(string); ok {
			user.Email = email
		} else {
			return nil, errors.New("user_email not found in token")
		}

		// Extract user_picture_url
		if picture, ok := claims["user_picture_url"].(string); ok {
			user.PictureURL = picture
		}

		// Extract user_given_name
		if givenName, ok := claims["user_given_name"].(string); ok {
			user.GivenName = givenName
		}

		// Extract user_family_name
		if familyName, ok := claims["user_family_name"].(string); ok {
			user.FamilyName = familyName
		}

		if dbSchema, ok := claims["user_organization_schema"].(string); ok {
			user.Organization.DBSchema = dbSchema
		}

		if orgIDFloat, ok := claims["user_organization_id"].(float64); ok {
			user.Organization.ID = uint(orgIDFloat)
		}

		// Other fields can be set to defaults (or left zero) since they are not in the token.
		return user, nil
	}

	return nil, errors.New("invalid token")
}

var (
	// ErrNoUser indicates no authenticated user was found in the context
	ErrNoUser = errors.New("no authenticated user in context")
	// ErrInvalidUserType indicates the value stored in context under "authenticated" was not a model.User
	ErrInvalidUserType = errors.New("authenticated user has unexpected type")
)

// GetUserFromContext extracts the authenticated User from Gin context.
// It returns ErrNoUser if none is set, or ErrInvalidUserType on a type mismatch.
func GetUserFromContext(c *gin.Context) (model.User, error) {
	raw, exists := c.Get("authenticated")
	if !exists {
		return model.User{}, ErrNoUser
	}

	user, ok := raw.(*model.User)
	if !ok {
		return model.User{}, ErrInvalidUserType
	}

	return *user, nil
}

var (
	// ErrNoStoreID indicates no storeID found in context
	ErrNoStoreID = errors.New("no store id in context")

	// ErrInvalidStoreID indicates storeID in context is not a uint
	ErrInvalidStoreID = errors.New("invalid store id in context")
)

// GetStoreIDFromContext extracts a uint storeID from Gin context.
// Returns ErrNoStoreID if not set, or ErrInvalidStoreID if type mismatches.
func GetStoreIDFromContext(c *gin.Context) (uint, error) {
	raw, exists := c.Get("storeID")
	if !exists {
		return 0, ErrNoStoreID
	}

	id, ok := raw.(uint)
	if !ok {
		return 0, ErrInvalidStoreID
	}

	return id, nil
}

func buildCommonClaims(user model.User) jwt.MapClaims {
	return jwt.MapClaims{
		"user_id":                  user.ID,
		"user_email":               user.Email,
		"user_picture_url":         user.PictureURL,
		"user_organization_id":     user.Organization.ID,
		"user_organization_schema": user.Organization.DBSchema,
		"user_given_name":          user.GivenName,
		"user_family_name":         user.FamilyName,
		"exp":                      time.Now().Add(8 * time.Hour).Unix(), // Token lifespan
		"iat":                      time.Now().Unix(),                    // Issued at
	}
}

// GetTryOutExpirationFromJWT parses a JWT and returns the tryout expiration time.
// Returns ErrInvalidToken if the token is invalid, and ErrNoTryOutClaim if the claim is missing or malformed.
func GetTryOutExpirationFromJWT(token jwt.Token) (time.Time, error) {

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return time.Time{}, errors.New("invalid jwt")
	}

	rawExp, exists := claims["tryout_expires_at"]
	if exists {

		expFloat, ok := rawExp.(float64)

		if !ok {
			return time.Time{}, errors.New("invalid tryout_expires_at jwt claim")
		}

		return time.Unix(int64(expFloat), 0), nil
	}

	return time.Time{}, nil
}
