package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"

	"net/http"

	auth "github.com/IlfGauhnith/GraoAGrao/pkg/auth"
	data_handler "github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler"
	data_errors "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

func GoogleAuthHandler(c *gin.Context) {
	logger.Log.Info("GoogleAuthHandler")

	// Generate a new state for each auth request
	state, err := util.GenerateOAuthState(32)
	if err != nil {
		logger.Log.Error("failed to generate oauth state")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate state"})
		return
	}

	stage := util.GetStage()

	if stage == "DEV" {
		// Store the state in a cookie (valid for 1 hour)
		c.SetCookie("oauthstate", state, 3600, "", "", false, true)
	} else if stage == "PROD" {
		APIDomain := os.Getenv("API_DOMAIN")
		c.SetSameSite(http.SameSiteNoneMode)
		c.SetCookie("oauthstate", state, 3600, "/", APIDomain, true, true)

	}

	// Send redirect url as googleUrl
	url := auth.GetAuthURL(state)
	c.JSON(http.StatusOK, gin.H{"googleUrl": url})
}

func GoogleAuthCallBackHandler(c *gin.Context) {
	logger.Log.Info("GoogleAuthCallBackHandler")

	// Retrieve the expected state from the cookie
	expectedState, err := c.Cookie("oauthstate")
	if err != nil {
		logger.Log.Error("state cookie not found")
		c.JSON(http.StatusBadRequest, gin.H{"error": "state cookie not found"})
		return
	}

	// Get the state from the request query parameters
	state := c.Query("state")
	if state != expectedState {
		logger.Log.Error("invalid oauth state")
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid oauth state"})
		return
	}

	// Get the authorization code from the query parameters
	code := c.Query("code")
	token, err := auth.ExchangeCode(code)
	if err != nil {
		logger.Log.Error("failed to exchange code: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Retrieve user info from Google using the access token
	userInfo, err := auth.GetUserInfo(token)
	if err != nil {
		logger.Log.Error("failed to get user info: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert the user info map to the struct
	var googleUserInfoStruct model.GoogleUserInfo
	userInfoBytes, err := json.Marshal(userInfo)
	if err != nil {
		logger.Log.Error("failed to marshal user info: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to marshal user info"})
		return
	}

	err = json.Unmarshal(userInfoBytes, &googleUserInfoStruct)
	if err != nil {
		logger.Log.Error("failed to unmarshal user info: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unmarshal user info"})
		return
	}

	userStruct, err := data_handler.GetUserByGoogleID(googleUserInfoStruct.ID)
	if err != nil {
		var googleUserNotFound *data_errors.GoogleIDUserNotFound
		if errors.As(err, &googleUserNotFound) {
			logger.Log.Info("Google user not found in DB. Creating new user.")
			// Update the outer variable, not creating a new one.
			userStruct = util.NewUserFromGoogleUserInfo(googleUserInfoStruct)
			if err = data_handler.SaveUser(userStruct); err != nil {
				logger.Log.Error("Error saving user: ", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving user"})
				return
			}
			logger.Log.Info("User successfully created from Google user info.")
		} else {
			logger.Log.Error("Error retrieving user by Google ID: ", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving user by Google ID"})
			return
		}
	}

	jwt, err := util.GenerateJWT(*userStruct)
	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// stamping last login with now
	data_handler.StampNowLastLogin(userStruct.ID)

	// Redirect to frontend with JWT and user info as query parameters
	frontendURL := os.Getenv("FRONTEND_URL")
	redirectURL := fmt.Sprintf("%s/OAuthCallback?token=%s&name=%s&email=%s&user_picture_url=%s", frontendURL, jwt, googleUserInfoStruct.Name, googleUserInfoStruct.Email, googleUserInfoStruct.Picture)
	c.Redirect(http.StatusFound, redirectURL)
}
