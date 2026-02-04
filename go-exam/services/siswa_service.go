package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type SiswaService interface {
	GetAll() ([]models.Siswa, error)
	Create(req models.CreateSiswaRequest) (models.Siswa, error)
	Update(id uint, req models.UpdateSiswaRequest) error
	Delete(id uint) error
}

type siswaService struct {
	siswaRepo repository.SiswaRepository
}

func NewSiswaService(repo repository.SiswaRepository) SiswaService {
	return &siswaService{repo}
}

func (s *siswaService) GetAll() ([]models.Siswa, error) {
	return s.siswaRepo.FindAll()
}

func (s *siswaService) Create(req models.CreateSiswaRequest) (models.Siswa, error) {
	siswa := models.Siswa{
		UserID:   req.UserID,
		ClassID:  req.ClassID,
		IsActive: req.IsActive,
	}

	err := s.siswaRepo.Create(&siswa)
	if err != nil {
		return models.Siswa{}, err
	}

	return siswa, nil
}

func (s *siswaService) Update(id uint, req models.UpdateSiswaRequest) error {
	data := map[string]interface{}{}

	if req.ClassID != nil {
		data["classid"] = *req.ClassID
	}
	if req.IsActive != nil {
		data["isactive"] = *req.IsActive
	}

	return s.siswaRepo.Update(id, data)
}

func (s *siswaService) Delete(id uint) error {
	return s.siswaRepo.Delete(id)
}
