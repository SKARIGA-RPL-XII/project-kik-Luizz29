package services

import (
	"errors"
	"time"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
	"gorm.io/gorm"
)

type ExamSecurityService interface {
	CreateSecurity(examId uint, req models.CreateExamSecurityRequest) error
	GetByExamId(examId uint) (*models.ExamSecurity, error)
	UpdateSecurity(examId uint, req models.CreateExamSecurityRequest) error
}

type examSecurityService struct {
	repo repository.ExamSecurityRepository
}

func NewExamSecurityService(repo repository.ExamSecurityRepository) ExamSecurityService {
	return &examSecurityService{repo}
}

func (s *examSecurityService) CreateSecurity(
	examId uint,
	req models.CreateExamSecurityRequest,
) error {

	existing, err := s.repo.GetByExamId(examId)

	if err == nil && existing != nil {
		return errors.New("security already exists")
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	security := models.ExamSecurity{
		ExamId: examId,

		EnableIpCheck:     req.EnableIpCheck,
		AllowedNetwork:    req.AllowedNetwork,

		EnableGeolocation: req.EnableGeolocation,
		Latitude:          req.Latitude,
		Longitude:         req.Longitude,
		RadiusMeter:       req.RadiusMeter,

		CreatedDate: time.Now(),
		UpdatedDate: time.Now(),
	}

	return s.repo.Create(&security)
}

func (s *examSecurityService) GetByExamId(examId uint) (*models.ExamSecurity, error) {
	return s.repo.GetByExamId(examId)
}

func (s *examSecurityService) UpdateSecurity(
	examId uint,
	req models.CreateExamSecurityRequest,
) error {

	security, err := s.repo.GetByExamId(examId)

	if err != nil {
		return err
	}

	security.EnableIpCheck = req.EnableIpCheck
	security.AllowedNetwork = req.AllowedNetwork

	security.EnableGeolocation = req.EnableGeolocation
	security.Latitude = req.Latitude
	security.Longitude = req.Longitude
	security.RadiusMeter = req.RadiusMeter

	security.UpdatedDate = time.Now()

	return s.repo.Update(security)
}
