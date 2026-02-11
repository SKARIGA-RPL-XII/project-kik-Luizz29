package services

import (
	"errors"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type QuestionOptionService interface {
	GetByDetail(detailID uint) ([]models.QuestionOption, error)
	Create(detailID uint, options []models.CreateOptionRequest) error
	DeleteByDetail(detailID uint) error
}

type questionOptionService struct {
	repo repository.QuestionOptionRepository
}

func NewQuestionOptionService(repo repository.QuestionOptionRepository) QuestionOptionService {
	return &questionOptionService{repo}
}
func (s *questionOptionService) GetByDetail(detailID uint) ([]models.QuestionOption, error) {
	return s.repo.GetByDetail(detailID)
}
func (s *questionOptionService) Create(
	detailID uint,
	options []models.CreateOptionRequest,
) error {

	correctCount := 0

	for _, opt := range options {
		if opt.IsCorrect {
			correctCount++
		}
	}

	if correctCount == 0 {
		return errors.New("Minimal harus ada 1 jawaban benar")
	}

	return s.repo.Create(detailID, options)
}

func (s *questionOptionService) DeleteByDetail(detailID uint) error {
	return s.repo.DeleteByDetail(detailID)
}
