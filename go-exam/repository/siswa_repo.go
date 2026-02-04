package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type SiswaRepository interface {
	FindAll() ([]models.Siswa, error)
	Create(siswa *models.Siswa) error
	Update(id uint, data map[string]interface{}) error
	Delete(id uint) error
}

type siswaRepository struct {
	db *gorm.DB
}

func NewSiswaRepository(db *gorm.DB) SiswaRepository {
	return &siswaRepository{db}
}

func (r *siswaRepository) FindAll() ([]models.Siswa, error) {
	var data []models.Siswa
	err := r.db.Order("siswaid ASC").Find(&data).Error
	return data, err
}

func (r *siswaRepository) Create(siswa *models.Siswa) error {
	return r.db.Create(siswa).Error
}

func (r *siswaRepository) Update(id uint, data map[string]interface{}) error {
	return r.db.Model(&models.Siswa{}).
		Where("siswaid = ?", id).
		Updates(data).Error
}

func (r *siswaRepository) Delete(id uint) error {
	return r.db.Where("siswaid = ?", id).
		Delete(&models.Siswa{}).Error
}
