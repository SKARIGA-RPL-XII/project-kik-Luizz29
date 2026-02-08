package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type SubjectRepository interface {
	Create(subject *models.Subject) error
	FindAll() ([]models.Subject, error)
	FindByID(id uint) (*models.Subject, error)
	Update(subject *models.Subject) error
	Delete(id uint) error
}

type subjectRepository struct {
	db *gorm.DB
}

func NewSubjectRepository(db *gorm.DB) SubjectRepository {
	return &subjectRepository{db}
}

func (r *subjectRepository) Create(subject *models.Subject) error {
	return r.db.Create(subject).Error
}

func (r *subjectRepository) FindAll() ([]models.Subject, error) {
	var subjects []models.Subject
	err := r.db.Order("createddate DESC").Find(&subjects).Error
	return subjects, err
}

func (r *subjectRepository) FindByID(id uint) (*models.Subject, error) {
	var subject models.Subject
	err := r.db.Where("subjectid = ?", id).First(&subject).Error
	return &subject, err
}

func (r *subjectRepository) Update(subject *models.Subject) error {
	return r.db.Save(subject).Error
}

func (r *subjectRepository) Delete(id uint) error {
	return r.db.Where("subjectid = ?", id).Delete(&models.Subject{}).Error
}
