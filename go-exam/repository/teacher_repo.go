package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)
type TeacherRepository interface {
	GetAll() ([]models.Teacher, error)
	Create(models.Teacher) (models.Teacher, error)
	Update(models.Teacher) error
	Delete(uint) error
	GetByID(uint) (models.Teacher, error)
}

type teacherRepository struct {
	db *gorm.DB
}

func NewTeacherRepository(db *gorm.DB) TeacherRepository {
	return &teacherRepository{db}
}

func (r *teacherRepository) GetAll() ([]models.Teacher, error) {
	var data []models.Teacher
	err := r.db.Find(&data).Error
	return data, err
}

func (r *teacherRepository) Create(t models.Teacher) (models.Teacher, error) {
	err := r.db.Create(&t).Error
	return t, err
}

func (r *teacherRepository) Update(t models.Teacher) error {
	return r.db.Save(&t).Error
}

func (r *teacherRepository) Delete(id uint) error {
	return r.db.Delete(&models.Teacher{}, id).Error
}

func (r *teacherRepository) GetByID(id uint) (models.Teacher, error) {
	var t models.Teacher
	err := r.db.First(&t, id).Error
	return t, err
}
