package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type QuestionBankRepository interface {
	GetAll() ([]models.QuestionBankHeader, error)
	Create(data *models.QuestionBankHeader) error
	Delete(id uint) error
}

type questionBankRepository struct {
	db *gorm.DB
}

func NewQuestionBankRepository(db *gorm.DB) QuestionBankRepository {
	return &questionBankRepository{db}
}

func (r *questionBankRepository) GetAll() ([]models.QuestionBankHeader, error) {
	var data []models.QuestionBankHeader

	err := r.db.Preload("Details").Find(&data).Error
	return data, err
}

func (r *questionBankRepository) Create(data *models.QuestionBankHeader) error {
	return r.db.Create(data).Error
}

func (r *questionBankRepository) Delete(id uint) error {
	return r.db.Delete(&models.QuestionBankHeader{}, id).Error
}
