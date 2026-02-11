package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
    "gorm.io/gorm"
)

type QuestionService interface {
	GetByHeader(headerID uint) ([]models.Question, error)
	Create(headerID uint, req models.CreateQuestionRequest) (*models.Question, error)
	Update(detailID uint, req models.UpdateQuestionRequest) error
	Delete(detailID uint) error
}

type questionService struct {
	repo repository.QuestionRepository
        db   *gorm.DB
}

func NewQuestionService(repo repository.QuestionRepository, db *gorm.DB) QuestionService {
	return &questionService{
		repo: repo,
		db:   db,
	}
}

func (s *questionService) GetByHeader(headerID uint) ([]models.Question, error) {
	return s.repo.GetByHeader(headerID)
}

func (s *questionService) Create(headerID uint, req models.CreateQuestionRequest) (*models.Question, error) {

    tx := s.db.Begin()

    // ================= INSERT QUESTION =================
    question := models.Question{
        HeaderID: headerID,
        Question: req.Question,
        Type:     req.Type,
        Score:    req.Score,
    }

    if err := tx.Create(&question).Error; err != nil {
        tx.Rollback()
        return nil, err
    }

    // ================= INSERT OPTIONS =================
    if question.Type == "mcq" {

        for _, opt := range req.Options {

            option := models.QuestionOption{
                DetailID: question.DetailID, 
                Label:    opt.Label,
                Text:     opt.Text,
                IsCorrect: opt.IsCorrect,
            }

            if err := tx.Create(&option).Error; err != nil {
                tx.Rollback()
                return nil, err
            }
        }
    }

    tx.Commit()

    return &question, nil
}


func (s *questionService) Update(detailID uint, req models.UpdateQuestionRequest) error {

	q := models.Question{
		DetailID: detailID,
		Question: req.Question,
		Type:     req.Type,
		Score:    req.Score,
	}

	return s.repo.Update(&q)
}

func (s *questionService) Delete(detailID uint) error {
	return s.repo.Delete(detailID)
}
