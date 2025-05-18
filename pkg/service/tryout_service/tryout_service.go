package tryout_service

import (
	"context"
	"fmt"
	"time"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/organization_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/tryout_job_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db/data_handler/user_repository"
	"github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	"github.com/google/uuid"

	"github.com/IlfGauhnith/GraoAGrao/pkg/model"
)

func PublishTryOutEnvironmentJob(user *model.User) (model.TryOutJob, error) {
	ctx := context.Background()
	conn, err := db.GetDB().Acquire(ctx)

	// Stablishing db connection and defer realase call
	if err != nil {
		return model.TryOutJob{}, fmt.Errorf("db connection: %w", err)
	}
	defer conn.Release()

	// Beginning transaction
	tx, err := conn.Begin(ctx)
	if err != nil {
		return model.TryOutJob{}, fmt.Errorf("tx begin: %w", err)
	}
	// If anything goes wrong, rollback
	defer func() {
		if err != nil {
			tx.Rollback(ctx)
		}
	}()

	// Creating job object
	uuid := uuid.New().String()
	job := model.TryOutJob{
		TryoutUUID: uuid,
		CreatedAt:  time.Now(),
		ExpiresAt:  time.Now().Add(24 * time.Hour),
		Organization: model.Organization{
			Name:     user.GivenName,
			Domain:   user.GivenName,
			DBSchema: fmt.Sprintf("%s-%s", user.GivenName, uuid),
			Key:      fmt.Sprintf("%s-%s", user.GivenName, uuid),
		},
		Status: "pending",
	}

	// 1. Insert organization
	if err := organization_repository.InsertOrganizationTx(ctx, tx, &job.Organization); err != nil {
		return job, err
	}

	user.Organization = job.Organization

	// 2. Insert user
	if err := user_repository.InsertUserTx(ctx, tx, user); err != nil {
		return job, err
	}

	job.CreatedBy = *user

	// 3. Insert tryout job
	if err := tryout_job_repository.InsertTryOutJobTx(ctx, tx, &job); err != nil {
		return job, err
	}

	// Commiting
	if err = tx.Commit(ctx); err != nil {
		return job, fmt.Errorf("tx commit: %w", err)
	}

	return job, nil
}

func ProcessTryOutEnvironmentJob(job *model.TryOutJob) error {
	logger.Log.Infof("ProcessTryOutJob job.uuid:%s", job.TryoutUUID)

	// Set job status as in_progress
	job.Status = "in_progress"
	err := tryout_job_repository.UpdateTryOutJob(job)
	if err != nil {
		logger.Log.Errorf("Error updating tryout job: %v", err)
		return err
	}

	err = tryout_job_repository.ProcessTryOutJob(job)
	if err != nil {
		logger.Log.Error(err)
		return err
	}

	return nil
}

func ExpireTryOutJob(job *model.TryOutJob) error {
	return nil
}
