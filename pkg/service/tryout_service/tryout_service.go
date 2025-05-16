package tryout_service

import (
	"fmt"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/google/uuid"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func PublishTryOutJob(user *model.User) (model.TryOutJob, error) {
	uuid := uuid.New().String()

	job := model.TryOutJob{
		TryoutUUID: uuid,
		CreatedBy:  *user,
		Organization: model.Organization{
			Name:     user.GivenName,
			Domain:   user.GivenName,
			DBSchema: fmt.Sprintf("%s-%s", user.GivenName, uuid),
			Key:      fmt.Sprintf("%s-%s", user.GivenName, uuid),
		},
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(time.Hour * 24),
	}

	err := tryout_repository.CreateTryOutJob(&job)
	if err != nil {
		logger.Log.Error(err)
		return job, err
	}

	return job, nil
}

func ProcessTryOutJob(job *model.TryOutJob) error {
	logger.Log.Infof("ProcessTryOutJob job.uuid:%s", job.TryoutUUID)

	// Set job status as in_progress
	job.Status = "in_progress"
	err := tryout_repository.UpdateTryOutJob(job)
	if err != nil {
		logger.Log.Errorf("Error updating tryout job: %v", err)
		return err
	}

	err = tryout_repository.ProcessTryOutJob(job)
	if err != nil {
		logger.Log.Error(err)
		return err
	}

	return nil
}

func ExpireTryOutJob(job *model.TryOutJob) error {
	return nil
}
