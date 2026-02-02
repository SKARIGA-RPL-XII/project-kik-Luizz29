package services

import (
	"errors"

	"golang.org/x/crypto/bcrypt"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type UserService interface {
	GetUsers() ([]models.User, error)
	GetProfile(userID uint) (*models.User, error)
	Create(req models.CreateUserRequest) (*models.User, error)
	Update(id uint, req models.UpdateUserRequest) error
	Delete(id uint) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo}
}

func (s *userService) GetUsers() ([]models.User, error) {
	return s.repo.FindAll()
}

func (s *userService) GetProfile(userID uint) (*models.User, error) {
	return s.repo.FindByID(userID)
}

func (s *userService) Create(req models.CreateUserRequest) (*models.User, error) {
	user := models.User{
		Name:   req.Name,
		Email: req.Email,
		RoleID: req.RoleID,
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed hash password")
	}
	user.Password = string(hashed)

	err = s.repo.Create(&user)
	return &user, err
}

func (s *userService) Update(id uint, req models.UpdateUserRequest) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		user.Password = string(hashed)
	}

	return s.repo.Update(user)
}

func (s *userService) Delete(id uint) error {
	return s.repo.Delete(id)
}
