package repository

import "github.com/Luizz29/go-gin-project/models"

type SelectRepository interface {
	GetRoles() ([]models.SelectRole, error)
	GetUsers() ([]models.SelectUser, error)
	GetClasses() ([]models.SelectClass, error)

	GetSubjects() ([]models.SelectSubject, error) 
}
