package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type ExamSecurityRepository interface {
	GetByExamId(examId uint) (*models.ExamSecurity, error)
	Create(security *models.ExamSecurity) error
	Update(security *models.ExamSecurity) error
}

type examSecurityRepository struct {
	db *gorm.DB
}

func NewExamSecurityRepository(db *gorm.DB) ExamSecurityRepository {
	return &examSecurityRepository{db}
}

func (r *examSecurityRepository) GetByExamId(examId uint) (*models.ExamSecurity, error) {

	var security models.ExamSecurity

	err := r.db.
		Where("examid = ?", examId).
		First(&security).Error

	if err != nil {
		return nil, err
	}

	return &security, nil
}

func (r *examSecurityRepository) Create(security *models.ExamSecurity) error {
	return r.db.Create(security).Error
}

func (r *examSecurityRepository) Update(security *models.ExamSecurity) error {
	return r.db.Save(security).Error
}
