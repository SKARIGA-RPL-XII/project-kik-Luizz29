package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type QuestionOptionRepository interface {
	GetByDetail(detailID uint) ([]models.QuestionOption, error)
	Create(detailID uint, options []models.CreateOptionRequest) error
	DeleteByDetail(detailID uint) error
}

type questionOptionRepository struct {
	db *gorm.DB
}

func NewQuestionOptionRepository(db *gorm.DB) QuestionOptionRepository {
	return &questionOptionRepository{db}
}
func (r *questionOptionRepository) GetByDetail(detailID uint) ([]models.QuestionOption, error) {

	var options []models.QuestionOption

	err := r.db.
		Where("detailid = ?", detailID).
		Order("label asc").
		Find(&options).Error

	return options, err
}

func (r *questionOptionRepository) Create(
	detailID uint,
	req []models.CreateOptionRequest,
) error {

	for _, opt := range req {

		option := models.QuestionOption{
			DetailID:  detailID,
			Label:     opt.Label,
			Text:      opt.Text,
			IsCorrect: opt.IsCorrect,
		}

		if err := r.db.Create(&option).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *questionOptionRepository) DeleteByDetail(detailID uint) error {
	return r.db.
		Where("detailid = ?", detailID).
		Delete(&models.QuestionOption{}).Error
}


