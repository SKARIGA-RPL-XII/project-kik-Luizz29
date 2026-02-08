package services

import (
	"time"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)
type TeacherService interface {
	GetAll() ([]models.Teacher, error)
	Create(models.CreateTeacherRequest) (models.Teacher, error)
	Update(uint, models.UpdateTeacherRequest) error
	Delete(uint) error
}
type teacherService struct {
	repo repository.TeacherRepository
}

func NewTeacherService(r repository.TeacherRepository) TeacherService {
	return &teacherService{r}
}

func (s *teacherService) GetAll() ([]models.Teacher, error) {
	return s.repo.GetAll()
}

func (s *teacherService) Create(req models.CreateTeacherRequest) (models.Teacher, error) {

	data := models.Teacher{
		TeacherNm:   req.TeacherNm,
		UserID:      req.UserID,
		IsActive:    req.IsActive,
		CreatedDate: time.Now(),
	}

	return s.repo.Create(data)
}

func (s *teacherService) Update(id uint, req models.UpdateTeacherRequest) error {

	data, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	data.TeacherNm = req.TeacherNm
	data.UserID = req.UserID
	data.IsActive = req.IsActive
	data.UpdatedDate = time.Now()

	return s.repo.Update(data)
}

func (s *teacherService) Delete(id uint) error {
	return s.repo.Delete(id)
}
