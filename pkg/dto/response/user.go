package response

// UserResponse would live in its own file (dto/response/user.go),
type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
