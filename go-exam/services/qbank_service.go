package services

import (
	"time"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type QuestionBankService interface {
	GetAll() ([]models.QuestionBankHeader, error)
	Create(req models.CreateQuestionBankRequest) (*models.QuestionBankHeader, error)
	Delete(id uint) error
}

type questionBankService struct {
	repo repository.QuestionBankRepository
}

func NewQuestionBankService(repo repository.QuestionBankRepository) QuestionBankService {
	return &questionBankService{repo}
}

func (s *questionBankService) GetAll() ([]models.QuestionBankHeader, error) {
	return s.repo.GetAll()
}

func (s *questionBankService) Create(req models.CreateQuestionBankRequest) (*models.QuestionBankHeader, error) {

	header := models.QuestionBankHeader{
		Title:       req.Title,
		SubjectID:   req.SubjectID,
		TeacherID:   req.TeacherID,
		Description: req.Description,
		CreatedDate: time.Now(),
		UpdatedDate: time.Now(),
	}

	for _, d := range req.Details {
		header.Details = append(header.Details, models.QuestionBankDetail{
			Question: d.Question,
			Type:     d.Type,
			Score:    d.Score,
		})
	}

	err := s.repo.Create(&header)
	return &header, err
}

func (s *questionBankService) Delete(id uint) error {
	return s.repo.Delete(id)
}
