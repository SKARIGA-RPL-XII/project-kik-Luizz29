package repository

import "github.com/Luizz29/go-gin-project/models"

type SelectRepository interface {
	GetRoles() ([]models.SelectRole, error)
	GetUsers() ([]models.SelectUser, error)
	GetClasses() ([]models.SelectClass, error)

	GetSubjects() ([]models.SelectSubject, error) 
	GetTeachers() ([]models.SelectTeacher, error)
}
func (r *selectRepository) GetTeachers() ([]models.SelectTeacher, error) {
    var teachers []models.SelectTeacher
    

    err := r.db.Find(&teachers).Error 
    
    return teachers, err
}