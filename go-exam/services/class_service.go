package services

import (
    "github.com/Luizz29/go-gin-project/models"
    "github.com/Luizz29/go-gin-project/repository"
)

type ClassService interface {
    GetAll() ([]models.Class, error)
    Create(req models.CreateClassRequest) (models.Class, error)
    Update(id uint, req models.UpdateClassRequest) error
    Delete(id uint) error
}

type classService struct {
    classRepo repository.ClassRepository
}

func NewClassService(classRepo repository.ClassRepository) ClassService {
    return &classService{classRepo: classRepo}
}

func (s *classService) GetAll() ([]models.Class, error) {
    return s.classRepo.FindAll()
}

func (s *classService) Create(req models.CreateClassRequest) (models.Class, error) {
    class := models.Class{
        ClassNm:  req.ClassNm,
        IsActive: req.IsActive,
    }

    err := s.classRepo.Create(&class)
    if err != nil {
        return models.Class{}, err
    }

    return class, nil
}

func (s *classService) Update(id uint, req models.UpdateClassRequest) error {
    data := map[string]interface{}{}

    if req.ClassNm != "" {
        data["classnm"] = req.ClassNm
    }
    if req.IsActive != nil {
        data["isactive"] = *req.IsActive
    }

    return s.classRepo.Update(id, data)
}

func (s *classService) Delete(id uint) error {
    return s.classRepo.Delete(id)
}
