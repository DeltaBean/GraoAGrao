package util

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"

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

// GenerateJWT generates a new JWT token with claims
func GenerateJWT(user model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":          user.ID,
		"user_email":       user.Email,
		"user_picture_url": user.PictureURL,
		"user_given_name":  user.GivenName,
		"user_family_name": user.FamilyName,
		"exp":              time.Now().Add(time.Hour * 8).Unix(), // Token expiration time (8 hours)
		"iat":              time.Now().Unix(),                    // Issued at time
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		logger.Log.Errorf("Error signing JWT token: %v", err)
		return "", err
	}

	logger.Log.Infof("JWT token generated for user %d", user.ID)
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
func GetUserFromJWT(tokenString string) (*model.User, error) {
	// Check if the header is provided.
	if len(tokenString) == 0 {
		return nil, errors.New("authorization header not provided")
	}

	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	} else {
		return nil, errors.New("authorization header must start with 'Bearer '")
	}

	// Parse the token.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Use the secret from the environment variable.
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			return nil, errors.New("JWT_SECRET not set in environment")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	// Validate and extract claims.
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		user := &model.User{}

		// Extract user_id (stored as a number, so we cast to float64 then to int)
		if idFloat, ok := claims["user_id"].(float64); ok {
			user.ID = int(idFloat)
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

		// Other fields can be set to defaults (or left zero) since they are not in the token.
		return user, nil
	}

	return nil, errors.New("invalid token")
}
