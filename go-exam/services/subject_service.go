package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type SubjectService interface {
	Create(req models.CreateSubjectRequest) (*models.Subject, error)
	GetAll() ([]models.Subject, error)
	Update(id uint, req models.UpdateSubjectRequest) error
	Delete(id uint) error
}

type subjectService struct {
	repo repository.SubjectRepository
}

func NewSubjectService(repo repository.SubjectRepository) SubjectService {
	return &subjectService{repo}
}

func (s *subjectService) Create(req models.CreateSubjectRequest) (*models.Subject, error) {
	subject := models.Subject{
		SubjectNm:   req.SubjectNm,
		SubjectCode: req.SubjectCode,
	}
	err := s.repo.Create(&subject)
	return &subject, err
}

func (s *subjectService) GetAll() ([]models.Subject, error) {
	return s.repo.FindAll()
}

func (s *subjectService) Update(id uint, req models.UpdateSubjectRequest) error {
	subject, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if req.SubjectNm != "" {
		subject.SubjectNm = req.SubjectNm
	}
	if req.SubjectCode != "" {
		subject.SubjectCode = req.SubjectCode
	}

	return s.repo.Update(subject)
}

func (s *subjectService) Delete(id uint) error {
	return s.repo.Delete(id)
}
