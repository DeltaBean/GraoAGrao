// user_repository.go
package user_repository

import (
	"context"
	"fmt"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"
	"github.com/IlfGauhnith/GraoAGrao/pkg/db"

	data_errors "github.com/IlfGauhnith/GraoAGrao/pkg/errors"
	logger "github.com/IlfGauhnith/GraoAGrao/pkg/logger"
	model "github.com/IlfGauhnith/GraoAGrao/pkg/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SaveUser inserts a new user into the tb_user table
// and returns the new user ID and timestamps.
func SaveUser(conn *pgxpool.Conn, user *model.User) error {
	logger.Log.Info("CreateUser")

	query := `
		INSERT INTO public.tb_user (
			username, email, password_hash, salt, google_id, organization_id,
			given_name, family_name, picture_url, auth_provider, is_active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING user_id, created_at, updated_at`
	err := conn.QueryRow(context.Background(), query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Salt,
		user.GoogleID,
		user.Organization.ID,
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
func GetUserByID(conn *pgxpool.Conn, id uint) (*model.User, error) {
	logger.Log.Info("GetUserByID")

	query := `
		SELECT user_id, username, email, password_hash, salt, google_id,
		       given_name, family_name, picture_url, auth_provider,
		       created_at, updated_at, last_login, is_active
		FROM public.tb_user
		WHERE user_id = $1`
	user := &model.User{}
	err := conn.QueryRow(context.Background(), query, id).Scan(
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
func GetUserByEmail(conn *pgxpool.Conn, email string) (*model.User, error) {
	logger.Log.Info("GetUserByEmail")

	query := `
		SELECT user_id, username, email, password_hash, salt, google_id,
		       given_name, family_name, picture_url, auth_provider,
		       created_at, updated_at, last_login, is_active
		FROM public.tb_user
		WHERE email = $1`
	user := &model.User{}
	err := conn.QueryRow(context.Background(), query, email).Scan(
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
func UpdateUser(conn *pgxpool.Conn, user *model.User) error {
	logger.Log.Info("UpdatedUser")
	query := `
		UPDATE public.tb_user
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
func DeleteUser(conn *pgxpool.Conn, id uint) error {
	logger.Log.Info("DeleteUser")

	query := `DELETE FROM public.tb_user WHERE user_id = $1`
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
		SELECT us.user_id, us.username, us.email, us.password_hash, us.salt, us.google_id,
		       us.given_name, us.family_name, us.picture_url, us.auth_provider,
		       us.created_at, us.updated_at, us.last_login, us.is_active,
			   org.organization_id, org.organization_name, org.organization_key, org.domain, org.schema_name
		FROM public.tb_user us
		JOIN tb_organization org ON us.organization_id = org.organization_id
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
		&user.Organization.ID,
		&user.Organization.Name,
		&user.Organization.Key,
		&user.Organization.Domain,
		&user.Organization.DBSchema,
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
		UPDATE public.tb_user 
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

func InsertUserTx(ctx context.Context, tx pgx.Tx, user *model.User) error {
	query := `INSERT INTO public.tb_user (username, email, password_hash, salt, google_id, organization_id, given_name, family_name, picture_url, auth_provider, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING user_id, created_at, updated_at`
	return tx.QueryRow(ctx, query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.Salt,
		user.GoogleID,
		user.Organization.ID,
		user.GivenName,
		user.FamilyName,
		user.PictureURL,
		user.AuthProvider,
		user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}
