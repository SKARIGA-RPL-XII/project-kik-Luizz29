package services

import (
	"errors"

	"golang.org/x/crypto/bcrypt"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
	"github.com/Luizz29/go-gin-project/utils"
)

type AuthService interface {
	Login(req models.LoginRequest) (interface{}, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{userRepo}
}

func (s *authService) Login(req models.LoginRequest) (interface{}, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("email atau password salah")
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(req.Password),
	); err != nil {
		return nil, errors.New("email atau password salah")
	}

	token, err := utils.GenerateToken(
		user.ID,
		user.Email,
		user.RoleID,
	)
	if err != nil {
		return nil, errors.New("gagal generate token")
	}

	return map[string]interface{}{
		"token": token,
		"user":  user,
	}, nil
}
