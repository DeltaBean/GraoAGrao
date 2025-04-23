// user_repository.go
package data_handler

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	db "github.com/IlfGauhnith/GraoAGrao/pkg/db"
	data_errors "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
)

// SaveUser inserts a new user into the tb_user table
// and returns the new user ID and timestamps.
func SaveUser(user *model.User) error {
	logger.Log.Info("CreateUser")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		INSERT INTO tb_user (
			username, email, password_hash, salt, google_id,
			given_name, family_name, picture_url, auth_provider, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING user_id, created_at, updated_at`
	err = conn.QueryRow(context.Background(), query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Salt,
		user.GoogleID,
		user.GivenName,
		user.FamilyName,
		user.PictureURL,
		user.AuthProvider,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		logger.Log.Errorf("Error creating user: %v", err)
		return err
	}

	logger.Log.Info("User successfully created.")

	return nil
}

// GetUserByID retrieves a user from the tb_user table by user_id.
func GetUserByID(id uint) (*model.User, error) {
	logger.Log.Info("GetUserByID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		SELECT user_id, username, email, password_hash, salt, google_id,
		       given_name, family_name, picture_url, auth_provider,
		       created_at, updated_at, last_login, is_active
		FROM tb_user
		WHERE user_id = $1`
	user := &model.User{}
	err = conn.QueryRow(context.Background(), query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Salt,
		&user.GoogleID,
		&user.GivenName,
		&user.FamilyName,
		&user.PictureURL,
		&user.AuthProvider,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
		&user.IsActive,
	)
	if err != nil {
		logger.Log.Errorf("Error fetching user by ID: %v", err)
		return nil, err
	}

	logger.Log.Info("User successfully retrivied.")

	return user, nil
}

// GetUserByEmail retrieves a user from the tb_user table by email.
func GetUserByEmail(email string) (*model.User, error) {
	logger.Log.Info("GetUserByEmail")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		SELECT user_id, username, email, password_hash, salt, google_id,
		       given_name, family_name, picture_url, auth_provider,
		       created_at, updated_at, last_login, is_active
		FROM tb_user
		WHERE email = $1`
	user := &model.User{}
	err = conn.QueryRow(context.Background(), query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Salt,
		&user.GoogleID,
		&user.GivenName,
		&user.FamilyName,
		&user.PictureURL,
		&user.AuthProvider,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
		&user.IsActive,
	)
	if err != nil {
		logger.Log.Errorf("Error fetching user by email: %v", err)
		return nil, err
	}

	logger.Log.Info("User successfully retrivied.")

	return user, nil
}

// UpdateUser updates an existing user in the tb_user table.
func UpdateUser(user *model.User) error {
	logger.Log.Info("UpdatedUser")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		UPDATE tb_user
		SET username = $1,
		    email = $2,
		    password_hash = $3,
		    salt = $4,
		    google_id = $5,
		    given_name = $6,
		    family_name = $7,
		    picture_url = $8,
		    auth_provider = $9,
		    updated_at = NOW(),
		    last_login = $10,
		    is_active = $11
		WHERE user_id = $12`
	cmdTag, err := conn.Exec(context.Background(), query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Salt,
		user.GoogleID,
		user.GivenName,
		user.FamilyName,
		user.PictureURL,
		user.AuthProvider,
		user.LastLogin, // set last_login if available
		user.IsActive,
		user.ID,
	)
	if err != nil {
		logger.Log.Errorf("Error updating user: %v", err)
		return err
	}
	if cmdTag.RowsAffected() != 1 {
		return fmt.Errorf("no user updated")
	}

	logger.Log.Info("User successfully updated.")

	return nil
}

// DeleteUser deletes a user from the tb_user table by user_id.
func DeleteUser(id uint) error {
	logger.Log.Info("DeleteUser")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `DELETE FROM tb_user WHERE user_id = $1`
	cmdTag, err := conn.Exec(context.Background(), query, id)
	if err != nil {
		logger.Log.Errorf("Error deleting user: %v", err)
		return err
	}
	if cmdTag.RowsAffected() != 1 {
		return fmt.Errorf("no user deleted")
	}

	logger.Log.Info("User successfully deleted.")

	return nil
}

// GetUserByGoogleID retrieves a user from the tb_user table by google_id.
func GetUserByGoogleID(googleID string) (*model.User, error) {
	logger.Log.Info("GetUserByGoogleID")

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return nil, err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		SELECT user_id, username, email, password_hash, salt, google_id,
		       given_name, family_name, picture_url, auth_provider,
		       created_at, updated_at, last_login, is_active
		FROM tb_user
		WHERE google_id = $1`
	user := &model.User{}
	err = conn.QueryRow(context.Background(), query, googleID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Salt,
		&user.GoogleID,
		&user.GivenName,
		&user.FamilyName,
		&user.PictureURL,
		&user.AuthProvider,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
		&user.IsActive,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Log.Info("No user found for google_id: " + googleID)
			return nil, &data_errors.GoogleIDUserNotFound{GoogleID: googleID}
		}
		logger.Log.Errorf("Error fetching user by google_id: %v", err)
		return nil, err
	}

	logger.Log.Info("User successfully retrieved.")
	return user, nil
}

// UpdateLastLogin updates the last_login field of a user to the current timestamp,
// based on the provided user id.
func StampNowLastLogin(userID uint) error {
	logger.Log.Infof("Updating last login for user id: %d", userID)

	conn, err := db.GetDB().Acquire(context.Background())
	if err != nil {
		logger.Log.Errorf("Error acquiring connection: %v", err)
		return err
	}
	logger.Log.Info("DB connection successfully acquired.")
	defer conn.Release()

	query := `
		UPDATE tb_user 
		SET last_login = NOW()
		WHERE user_id = $1
	`

	cmdTag, err := conn.Exec(context.Background(), query, userID)
	if err != nil {
		logger.Log.Errorf("Error updating last_login: %v", err)
		return err
	}

	// Check if the update affected any row. If not, it means the user was not found.
	if cmdTag.RowsAffected() == 0 {
		err = fmt.Errorf("no user found with id %d", userID)
		logger.Log.Error(err)
		return err
	}

	logger.Log.Infof("Successfully updated last login for user id: %d", userID)
	return nil
}
