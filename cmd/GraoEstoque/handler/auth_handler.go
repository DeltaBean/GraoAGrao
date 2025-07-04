package handler

import (
	"errors"
	"fmt"
	"os"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/user_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"

	"net/http"

	auth_handler_util "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler_util"
	auth "github.com/IlfGauhnith/GraoAGrao/pkg/auth"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GoogleAuthHandler handles the initiation of the Google OAuth authentication process.
// It generates a unique OAuth state, stores it in a cookie, and returns the Google authentication URL.
// The handler distinguishes between development ("DEV") and production ("PROD") environments to set cookies appropriately:
//   - In "DEV", cookies are set with default domain and security settings.
//   - In "PROD", cookies are set with the API domain, secure, and SameSite=None attributes for cross-site requests.
//
// GoogleAuthHandler godoc
// @Summary Initiates the Google OAuth2 authentication process
// @Description Generates a new OAuth2 state, stores it in cookies, and returns a Google authentication URL.
// @Tags Auth
// @Produce  json
// @Param isTryOut query string false "Flag to indicate if the user is creating a try-out environment"
// @Success 200 {object} response.GoogleInitOAuthResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /auth/google [get]
func GoogleAuthHandler(c *gin.Context) {
	logger.Log.Info("GoogleAuthHandler")

	// Generate a new state for each auth request
	state, err := util.GenerateOAuthState(32)
	if err != nil {
		logger.Log.Error("failed to generate oauth state")
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to generate state"})
		return
	}

	// The "isTryOut" parameter indicates whether the user is attempting to create a try-out environment to test the system.
	// This value is also stored in a cookie for later use during the authentication flow.
	isTryOut := c.Query("isTryOut")
	stage := util.GetStage()
	if stage == "DEV" {
		// Store the state in a cookie (valid for 1 hour)
		c.SetCookie("oauthstate", state, 3600, "", "", false, true)
		c.SetCookie("isTryOut", isTryOut, 3600, "", "", false, true)
	} else if stage == "PROD" {
		APIDomain := os.Getenv("API_DOMAIN")
		c.SetSameSite(http.SameSiteNoneMode)
		c.SetCookie("oauthstate", state, 3600, "/", APIDomain, true, true)
		c.SetCookie("isTryOut", isTryOut, 3600, "/", APIDomain, true, true)
	}

	// Send redirect url as googleUrl
	url := auth.GetAuthURL(state)
	c.JSON(http.StatusOK, response.GoogleInitOAuthResponse{GoogleUrl: url})
}

// GoogleAuthCallBackHandler godoc
// @Summary OAuth2 callback handler for Google login
// @Description This endpoint is used internally by Google OAuth2. It validates the OAuth state, retrieves user info, and redirects the user to the frontend with a JWT or error information. **This endpoint should not be called directly.**
// @Tags Auth
// @Produce json
// @Param state query string true "OAuth2 state"
// @Param code query string true "OAuth2 authorization code"
// @Success 302 "Redirects to frontend with JWT or error payload in query parameters"
// @Failure 400 {object} response.ErrorResponse "Invalid OAuth2 state or failed to exchange code"
// @Failure 500 {object} response.ErrorResponse "Internal server error"
// @Router /auth/google/callback [get]
func GoogleAuthCallBackHandler(c *gin.Context) {
	logger.Log.Info("GoogleAuthCallBackHandler")
	frontendURL := os.Getenv("FRONTEND_URL")

	// Step 1: Validate state and exchange code for token
	googleUserInfoStruct, err := auth_handler_util.ValidateOAuthStateAndGetUser(c)
	if err != nil {
		return
	}

	// Step 2: Try to retrieve user by Google ID
	userStruct, err := user_repository.GetUserByGoogleID(googleUserInfoStruct.ID)
	if err != nil {
		var googleUserNotFound *errorCodes.GoogleIDUserNotFound
		if errors.As(err, &googleUserNotFound) {
			logger.Log.Info("Google user not found in DB.")

			isTryOut, _ := c.Cookie("isTryOut")
			if isTryOut == "true" {
				HandleTryOutFlow(c, googleUserInfoStruct, frontendURL)
				return
			}

			auth_handler_util.RedirectWithError(c, frontendURL, "No user is associated with this Google account.", errorCodes.CodeGoogleUserNotFound)
			return
		}

		logger.Log.Error("Error retrieving user by Google ID: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error retrieving user by Google ID"})
		return
	}

	handleExistingUserFlow(c, userStruct, googleUserInfoStruct, frontendURL)
}

func handleExistingUserFlow(c *gin.Context, user *model.User, googleUser model.GoogleUserInfo, frontendURL string) {
	var jwt string
	var err error

	if user.Organization.IsTryOut {
		jwt, err = util.GenerateTryOutJWT(*user, *user.Organization.ExpiresAt)
	} else {
		jwt, err = util.GenerateJWT(*user)
	}

	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err.Error())
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to generate token"})
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
