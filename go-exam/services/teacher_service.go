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
		SubjectID:   req.SubjectID, // penting
		IsActive:    req.IsActive,
		CreatedDate: time.Now(),
	}

	return s.repo.Create(data)
}
func (s *teacherService) Update(id uint, req models.UpdateTeacherRequest) error {
	data := make(map[string]interface{})

	if req.TeacherNm != nil {
		data["teachernm"] = *req.TeacherNm
	}
	if req.UserID != nil {
		data["userid"] = *req.UserID
	}
	if req.SubjectID != nil {
		data["subjectid"] = *req.SubjectID
	}
	if req.IsActive != nil {
		data["isactive"] = *req.IsActive
	}
	data["updateddate"] = time.Now()

	return s.repo.Update(id, data)
}

func (s *teacherService) Delete(id uint) error {
	return s.repo.Delete(id)
}
