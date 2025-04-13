package data_errors

import "fmt"

// GoogleIDUserNotFound represents an error
// when a user is not found by Google ID.
type GoogleIDUserNotFound struct {
	GoogleID string
}

// Error returns the error message.
func (e *GoogleIDUserNotFound) Error() string {
	return fmt.Sprintf("user with Google ID %s not found", e.GoogleID)
}
