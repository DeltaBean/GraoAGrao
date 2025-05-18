package handler

import (
	"fmt"
	"net/http"
	"net/url"

	auth_handler_util "github.com/IlfGauhnith/GraoAGrao/cmd/GraoEstoque/handler_util"
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_job_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/user_repository"
	errorCodes "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/IlfGauhnith/GraoAGrao/pkg/service/tryout_service"
	util "github.com/IlfGauhnith/GraoAGrao/pkg/util"
	"github.com/gin-gonic/gin"
)

// GetTryOutJobStatus responds with the status of a try-out job.
func GetTryOutJobStatus(c *gin.Context) {
	uuid := c.Query("uuid")
	logger.Log.Infof("GetTryOutJobStatus uuid:%s", uuid)

	status, err := tryout_job_repository.GetTryOutJobStatusByUuid(uuid)
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"details": "Error fetching try-out job status",
		})
	}

	// 3) Return JSON payload
	c.JSON(http.StatusOK, gin.H{
		"uuid":   uuid,
		"status": status,
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

	jwt, err := util.GenerateJWT(job.CreatedBy)
	if err != nil {
		logger.Log.Error("failed to generate JWT: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
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
