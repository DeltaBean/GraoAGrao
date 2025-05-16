package auth_handler_util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/IlfGauhnith/GraoAGrao/pkg/auth"
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/user_repository"
	dtoResponse "github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/tryout_service"
	"github.com/IlfGauhnith/GraoAGrao/pkg/util"
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

func HandleTryOutFlow(c *gin.Context, googleUser model.GoogleUserInfo, frontendURL string) {
	// Creating user
	userStruct := util.NewUserFromGoogleUserInfo(googleUser)
	logger.Log.Info("User successfully converted from Google user info.")

	// Publishing try out environment setup job
	job, err := tryout_service.PublishTryOutJob(userStruct)
	if err != nil {
		logger.Log.Error("Failed to publish try-out job: ", err)
		RedirectWithError(c, frontendURL, "Failed to start try-out environment creation.", errorCodes.CodeStartTryOutEnvironment)
		return
	}

	job.CreatedBy.Organization = job.Organization
	jwt, err := util.GenerateJWT(job.CreatedBy)
	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	user_repository.StampNowLastLogin(job.CreatedBy.ID)
	// Immediately redirect to frontend with `isTryOut=true` query and user information
	redirectURL := fmt.Sprintf(
		"%s/OAuthCallback?isTryOut=true&uuid=%s&token=%s&name=%s&email=%s&user_picture_url=%s",
		frontendURL,
		job.TryoutUUID,
		jwt,
		url.QueryEscape(googleUser.Name),
		url.QueryEscape(googleUser.Email),
		url.QueryEscape(googleUser.Picture),
	)

	c.Redirect(http.StatusFound, redirectURL)
}

func HandleExistingUserFlow(c *gin.Context, user *model.User, googleUser model.GoogleUserInfo, frontendURL string) {
	jwt, err := util.GenerateJWT(*user)
	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	user_repository.StampNowLastLogin(user.ID)

	redirectURL := fmt.Sprintf(
		"%s/OAuthCallback?token=%s&name=%s&email=%s&user_picture_url=%s",
		frontendURL,
		jwt,
		googleUser.Name,
		googleUser.Email,
		googleUser.Picture,
	)
	c.Redirect(http.StatusFound, redirectURL)
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
