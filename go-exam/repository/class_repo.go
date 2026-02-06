package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type ClassRepository interface {
	FindAll() ([]models.Class, error)
	Create(class *models.Class) error
	Update(id uint, data map[string]interface{}) error
	Delete(id uint) error
}

type classRepository struct {
	db *gorm.DB
}

func NewClassRepository(db *gorm.DB) ClassRepository {
	return &classRepository{db}
}

func (r *classRepository) FindAll() ([]models.Class, error) {
	var classes []models.Class
	err := r.db.Order("classid ASC").Find(&classes).Error
	return classes, err
}

func (r *classRepository) Create(class *models.Class) error {
	return r.db.Create(class).Error
}

func (r *classRepository) Update(id uint, data map[string]interface{}) error {
	return r.db.Model(&models.Class{}).
		Where("classid = ?", id).
		Updates(data).Error
}

func (r *classRepository) Delete(id uint) error {
	return r.db.Where("classid = ?", id).
		Delete(&models.Class{}).Error
}
