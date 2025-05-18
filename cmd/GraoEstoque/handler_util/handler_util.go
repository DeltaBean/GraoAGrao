package handler_util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/IlfGauhnith/GraoAGrao/pkg/auth"
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/gin-gonic/gin"
)

func ValidateOAuthStateAndGetUser(c *gin.Context) (model.GoogleUserInfo, error) {
	expectedState, err := c.Cookie("oauthstate")
	if err != nil {
		logger.Log.Error("state cookie not found")
		c.JSON(http.StatusBadRequest, gin.H{"error": "state cookie not found"})
		return model.GoogleUserInfo{}, err
	}

	state := c.Query("state")
	if state != expectedState {
		logger.Log.Error("invalid oauth state")
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid oauth state"})
		return model.GoogleUserInfo{}, fmt.Errorf("invalid oauth state")
	}

	code := c.Query("code")
	token, err := auth.ExchangeCode(code)
	if err != nil {
		logger.Log.Error("failed to exchange code: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return model.GoogleUserInfo{}, err
	}

	userInfo, err := auth.GetUserInfo(token)
	if err != nil {
		logger.Log.Error("failed to get user info: ", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return model.GoogleUserInfo{}, err
	}

	var googleUserInfoStruct model.GoogleUserInfo
	userInfoBytes, err := json.Marshal(userInfo)
	if err != nil {
		logger.Log.Error("failed to marshal user info: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to marshal user info"})
		return model.GoogleUserInfo{}, err
	}

	err = json.Unmarshal(userInfoBytes, &googleUserInfoStruct)
	if err != nil {
		logger.Log.Error("failed to unmarshal user info: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unmarshal user info"})
		return model.GoogleUserInfo{}, err
	}

	return googleUserInfoStruct, nil
}

func RedirectWithError(c *gin.Context, frontendURL, detail string, internalCode errorCodes.ErrorCode) {
	errPayload := dtoResponse.GoogleUserNotFoundErrorResponse{
		InternalCode: internalCode,
		Details:      detail,
	}
	jsonBytes, err := json.Marshal(errPayload)
	if err != nil {
		logger.Log.Error("failed to marshal error payload: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	redirectURL := fmt.Sprintf("%s/OAuthCallback?error=%s", frontendURL, url.QueryEscape(string(jsonBytes)))
	c.Redirect(http.StatusFound, redirectURL)
}
