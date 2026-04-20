package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)
type TeacherRepository interface {
	GetAll() ([]models.Teacher, error)
	Create(models.Teacher) (models.Teacher, error)
	Update(uint, map[string]interface{}) error
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

func (r *teacherRepository) Update(id uint, data map[string]interface{}) error {
	return r.db.Model(&models.Teacher{}).Where("teacherid = ?", id).Updates(data).Error
}

func (r *teacherRepository) Delete(id uint) error {
	return r.db.Where("teacherid = ?", id).Delete(&models.Teacher{}).Error
}

func (r *teacherRepository) GetByID(id uint) (models.Teacher, error) {
	var t models.Teacher
	err := r.db.First(&t, id).Error
	return t, err
}
