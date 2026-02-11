package repository

import (
	"errors"

	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type QuestionRepository interface {
	GetByHeader(headerID uint) ([]models.Question, error)
	Create(question *models.Question) error
	CreateWithOptions(headerID uint, req models.CreateQuestionRequest) (*models.Question, error)
	Update(question *models.Question) error
	Delete(detailID uint) error
}

type questionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) QuestionRepository {
	return &questionRepository{db}
}


func (r *questionRepository) GetByHeader(headerID uint) ([]models.Question, error) {

	var questions []models.Question

	err := r.db.
		Where("headerid = ?", headerID).
		Find(&questions).Error

	return questions, err
}


func (r *questionRepository) Create(question *models.Question) error {
	return r.db.Create(question).Error
}

func (r *questionRepository) CreateWithOptions(
	headerID uint,
	req models.CreateQuestionRequest,
) (*models.Question, error) {

	var question models.Question

	err := r.db.Transaction(func(tx *gorm.DB) error {

		// ================= INSERT QUESTION =================
		question = models.Question{
			HeaderID: headerID,
			Question: req.Question,
			Type:     req.Type,
			Score:    req.Score,
		}

		if err := tx.Create(&question).Error; err != nil {
			return err
		}

		// ================= VALIDASI MCQ =================
		if req.Type == "mcq" {

			if len(req.Options) == 0 {
				return errors.New("Option tidak boleh kosong")
			}

			correctCount := 0

			for _, opt := range req.Options {

				if opt.IsCorrect {
					correctCount++
				}

				option := models.QuestionOption{
					DetailID:  question.DetailID,
					Label:     opt.Label,
					Text:      opt.Text,
					IsCorrect: opt.IsCorrect,
				}

				if err := tx.Create(&option).Error; err != nil {
					return err
				}
			}

			if correctCount == 0 {
				return errors.New("Minimal harus ada jawaban benar")
			}
		}

		return nil
	})

	return &question, err
}


func (r *questionRepository) Update(question *models.Question) error {
	return r.db.Save(question).Error
}


func (r *questionRepository) Delete(detailID uint) error {

	return r.db.Transaction(func(tx *gorm.DB) error {

		if err := tx.
			Where("detailid = ?", detailID).
			Delete(&models.QuestionOption{}).Error; err != nil {
			return err
		}

		if err := tx.
			Delete(&models.Question{}, detailID).Error; err != nil {
			return err
		}

		return nil
	})
}


