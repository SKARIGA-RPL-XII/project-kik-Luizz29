package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type SelectService interface {
	GetRoles() ([]models.SelectRole, error)
	GetUsers(roleName string) ([]models.SelectUser, error)
	GetClasses() ([]models.SelectClass, error)

	GetSubjects() ([]models.SelectSubject, error) 
	GetTeachers(subjectID uint) ([]models.SelectTeacher, error)
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

func (s *selectService) GetUsers(roleName string) ([]models.SelectUser, error) {
	return s.repo.GetUsers(roleName)
}

func (s *selectService) GetClasses() ([]models.SelectClass, error) {
	return s.repo.GetClasses()
}

func (s *selectService) GetSubjects() ([]models.SelectSubject, error) {
	return s.repo.GetSubjects()
}

func (s *selectService) GetTeachers(subjectID uint) ([]models.SelectTeacher, error) {
	return s.repo.GetTeachers(subjectID)
}

