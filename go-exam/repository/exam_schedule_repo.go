package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)
type ExamScheduleRepository interface {
	GetByExamId(examId uint) (*models.ExamSchedule, error)
	Create(schedule *models.ExamSchedule) error
	Update(schedule *models.ExamSchedule) error
}

type examScheduleRepository struct {
	db *gorm.DB
}



func NewExamScheduleRepository(db *gorm.DB) ExamScheduleRepository {
	return &examScheduleRepository{db}
}

func (r *examScheduleRepository) GetByExamId(examId uint) (*models.ExamSchedule, error) {

	var schedule models.ExamSchedule

	err := r.db.
		Where(&models.ExamSchedule{ExamId: examId}).
		First(&schedule).Error

	return &schedule, err
}


func (r *examScheduleRepository) Create(schedule *models.ExamSchedule) error {
	return r.db.Create(schedule).Error
}

func (r *examScheduleRepository) Update(schedule *models.ExamSchedule) error {
	return r.db.Save(schedule).Error
}
