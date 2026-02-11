package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)


type selectRepository struct {
    db *gorm.DB
}


func NewSelectRepository(db *gorm.DB) SelectRepository {
    return &selectRepository{db}
}


func (r *selectRepository) GetRoles() ([]models.SelectRole, error) {
	var roles []models.SelectRole

	err := r.db.Raw(`
		SELECT roleid, rolenm
		FROM msrole
		WHERE isactive = true
		ORDER BY rolenm ASC
	`).Scan(&roles).Error

	return roles, err
}

func (r *selectRepository) GetUsers() ([]models.SelectUser, error) {
	var users []models.SelectUser

	err := r.db.Raw(`
		SELECT id AS userid, name AS username
		FROM users
		WHERE isactive = true
		ORDER BY name ASC
	`).Scan(&users).Error

	return users, err
}


func (r *selectRepository) GetClasses() ([]models.SelectClass, error) {
	var classes []models.SelectClass

	err := r.db.Raw(`
		SELECT classid, classnm
		FROM msclass
		WHERE isactive = true
		ORDER BY classnm ASC
	`).Scan(&classes).Error

	return classes, err
}

func (r *selectRepository) GetSubjects() ([]models.SelectSubject, error) {
	var subjects []models.SelectSubject

	err := r.db.
		Table("mssubject").
		Select("subjectid, subjectnm").
		Find(&subjects).Error

	return subjects, err
}


