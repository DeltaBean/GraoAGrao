package model

import "time"

type GoogleUserInfo struct {
	Email         string `json:"email"`
	FamilyName    string `json:"family_name"`
	GivenName     string `json:"given_name"`
	ID            string `json:"id"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

type User struct {
	ID           uint         `json:"id"`
	Username     string       `json:"username"`
	Email        string       `json:"email"`
	PasswordHash string       `json:"password_hash"`
	Salt         string       `json:"salt"`
	GoogleID     string       `json:"google_id"`
	GivenName    string       `json:"given_name"`
	FamilyName   string       `json:"family_name"`
	PictureURL   string       `json:"picture_url"`
	AuthProvider string       `json:"auth_provider"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
	LastLogin    time.Time    `json:"last_login"`
	IsActive     bool         `json:"is_active"`
	Organization Organization `json:"organization"`
}

type Organization struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Domain    string    `json:"domain"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DBSchema  string    `json:"db_schema"`
	Key       string    `json:"key"`
	ExpiresAt time.Time `json:"expires_at"`
	IsTryOut  bool      `json:"is_try_out"`
}
