package repository

import "github.com/Luizz29/go-gin-project/models"

type SelectRepository interface {
	GetRoles() ([]models.SelectRole, error)
	GetUsers(roleName string) ([]models.SelectUser, error)
	GetClasses() ([]models.SelectClass, error)

	GetSubjects() ([]models.SelectSubject, error) 
	GetTeachers(subjectID uint) ([]models.SelectTeacher, error)
}
func (r *selectRepository) GetTeachers(subjectID uint) ([]models.SelectTeacher, error) {
    var teachers []models.SelectTeacher
    
    query := r.db
    if subjectID > 0 {
        query = query.Where("subjectid = ?", subjectID)
    }

    err := query.Find(&teachers).Error 
    
    return teachers, err
}