package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type SelectService interface {
	GetRoles() ([]models.SelectRole, error)
	GetUsers() ([]models.SelectUser, error)
	GetClasses() ([]models.SelectClass, error)

	GetSubjects() ([]models.SelectSubject, error) 
}


type selectService struct {
	repo repository.SelectRepository
}

func NewSelectService(repo repository.SelectRepository) SelectService {
	return &selectService{repo}
}

func (s *selectService) GetRoles() ([]models.SelectRole, error) {
	return s.repo.GetRoles()
}

func (s *selectService) GetUsers() ([]models.SelectUser, error) {
	return s.repo.GetUsers()
}

func (s *selectService) GetClasses() ([]models.SelectClass, error) {
	return s.repo.GetClasses()
}

func (s *selectService) GetSubjects() ([]models.SelectSubject, error) {
	return s.repo.GetSubjects()
}

