package handler

import (
	"fmt"
	"net/http"
	"net/url"

	auth_handler_util "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler_util"
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_job_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/user_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/dto/response"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/tryout_service"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetTryOutJobStatus godoc
// @Summary      Check status of try-out environment creation
// @Description  Polls the current status of the try-out environment creation job by UUID. This is meant to be called repeatedly by the client (polling) to determine when the try-out environment setup has completed or failed.
// @Tags         Try Out Environment
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        uuid  query   string  true  "Unique identifier for the try-out creation job"
// @Success      200  {object}  response.TryOutJobStatusResponse
// @Failure      500  {object}  response.ErrorResponse "Error fetching job status"
// @Router       /tryOut/status [get]
func GetTryOutJobStatus(c *gin.Context) {
	uuid := c.Query("uuid")
	logger.Log.Infof("GetTryOutJobStatus uuid:%s", uuid)

	status, err := tryout_job_repository.GetTryOutJobStatusByUuid(uuid)
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error fetching try-out job status"})
	}

	// 3) Return JSON payload
	c.JSON(http.StatusOK, response.TryOutJobStatusResponse{
		Uuid:   uuid,
		Status: status,
	})
}

func HandleTryOutFlow(c *gin.Context, googleUser model.GoogleUserInfo, frontendURL string) {
	user := util.NewUserFromGoogleUserInfo(googleUser)

	job, err := tryout_service.PublishTryOutEnvironmentJob(user)
	if err != nil {
		logger.Log.Error("Try-out setup failed: ", err)
		auth_handler_util.RedirectWithError(c, frontendURL, "Failed to start try-out environment.", errorCodes.CodeStartTryOutEnvironment)
		return
	}

	jwt, err := util.GenerateTryOutJWT(job.CreatedBy, *job.Organization.ExpiresAt)
	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to generate token"})
		return
	}

	user_repository.StampNowLastLogin(job.CreatedBy.ID)

	redirectURL := fmt.Sprintf(
		"%s/OAuthCallback?isTryOut=true&uuid=%s&token=%s&name=%s&email=%s&user_picture_url=%s",
		frontendURL,
		job.TryoutUUID,
		jwt,
		url.QueryEscape(user.GivenName),
		url.QueryEscape(user.Email),
		url.QueryEscape(user.PictureURL),
	)

	c.Redirect(http.StatusFound, redirectURL)
}

// DestroyTryOutEnvironment godoc
// @Summary      Destroy try-out environment
// @Description  Deletes all resources created for the authenticated user's try-out environment, including the tenant schema and associated data. This action is irreversible and is typically triggered after the user finishes exploring the platform or their free trial ends.
// @Tags         Try Out Environment
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Success      204  "Try-out environment destroyed successfully"
// @Failure      401  {object}  response.ErrorResponse "Unauthorized"
// @Failure      500  {object}  response.ErrorResponse "Error destroying try-out environment"
// @Router       /tryOut/destroyEnv [post]
func DestroyTryOutEnvironment(c *gin.Context) {
	logger.Log.Info("DestroyTryOutEnvironment")

	user, err := util.GetUserFromContext(c)
	if err != nil {
		if err == util.ErrNoUser {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse{Error: "unauthorized"})
		} else {
			c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "failed to get user"})
		}
		logger.Log.Error(err)
		c.Abort()
		return
	}

	err = tryout_job_repository.DestroyTryOutEnvironment(user.Organization.ID)

	if err != nil {
		logger.Log.Errorf("Error destroying organization id:%d", user.Organization.ID)
		c.JSON(http.StatusInternalServerError, response.ErrorResponse{Error: "Error destroying organization environment"})
		return
	}

	c.Status(http.StatusNoContent)
}
