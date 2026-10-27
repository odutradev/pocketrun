package admin

import (
	usersRepo "pocketrun-api/internal/domain/user/repositories/users"
)

type SetupAdminRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SetupAdminResponse struct {
	Token   string         `json:"token"`
	User    usersRepo.User `json:"user"`
	Message string         `json:"message"`
}

