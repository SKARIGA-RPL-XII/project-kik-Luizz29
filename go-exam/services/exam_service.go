package services

import (
	"time"

	"errors"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
	"gorm.io/gorm"
)

type examService struct {
	repo            repository.ExamRepository
	questionRepo    repository.QuestionRepository
	optionRepo      repository.QuestionOptionRepository
	classMemberRepo repository.ClassMemberRepository
	db              *gorm.DB
}

func NewExamService(
	repo repository.ExamRepository,
	questionRepo repository.QuestionRepository,
	optionRepo repository.QuestionOptionRepository,
	classMemberRepo repository.ClassMemberRepository,
	db *gorm.DB,
) ExamService {

	return &examService{
		repo:            repo,
		questionRepo:    questionRepo,
		optionRepo:      optionRepo,
		classMemberRepo: classMemberRepo,
		db:              db,
	}
}

type ExamService interface {
	Create(req models.ExamRequest, adminID uint) (*models.ExamHd, error)
	GetAll() ([]models.ExamHd, error)
	GetByID(id uint) (*models.ExamHd, error)
	Update(id uint, req models.ExamRequest) error
	Delete(id uint) error
	SetBank(examID uint, bankID uint) error
	SnapshotQuestions(examID uint, bankID uint) error
	GetExamQuestions(examID uint) ([]models.ExamQuestion, error)
	AssignClass(examID uint, req models.AssignClassRequest) error
	GetAssignedClasses(examID uint) ([]models.AssignedClassDTO, error)
	GetParticipants(examID uint) ([]models.ExamParticipantDTO, error)
	PublishExam(examID uint) error
}

func (s *examService) Create(req models.ExamRequest, adminID uint) (*models.ExamHd, error) {

	exam := models.ExamHd{
		ExamNm:      req.ExamNm,
		Description: req.Description,
		Duration:    req.Duration,
		Status:      "Draft",
		CreatedBy:   adminID,
		CreatedDate: time.Now(),
	}

	err := s.repo.Create(&exam)
	return &exam, err
}

func (s *examService) GetAll() ([]models.ExamHd, error) {
	return s.repo.GetAll()
}

func (s *examService) GetByID(id uint) (*models.ExamHd, error) {
	return s.repo.GetByID(id)
}

func (s *examService) Update(id uint, req models.ExamRequest) error {

	exam, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if exam.Status == "Published" {
		return errors.New("exam already published")
	}

	exam.ExamNm = req.ExamNm
	exam.Description = req.Description
	exam.Duration = req.Duration

	return s.repo.Update(exam)
}

func (s *examService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *examService) SetBank(examID uint, bankID uint) error {

	tx := s.db.Begin()

	// Update bank
	if err := tx.Model(&models.ExamHd{}).
		Where("id = ?", examID).
		Update("questionbankid", bankID).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Snapshot
	if err := s.SnapshotQuestions(examID, bankID); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *examService) SnapshotQuestions(examID uint, bankID uint) error {

	questions, err := s.questionRepo.GetByHeader(bankID)
	if err != nil {
		return err
	}

	for _, q := range questions {

		examQ := models.ExamQuestion{
			ExamID:   examID,
			Question: q.Question,
			Type:     q.Type,
			Score:    q.Score,
		}

		if err := s.db.Create(&examQ).Error; err != nil {
			return err
		}

		// COPY OPTION
		options, err := s.optionRepo.GetByDetail(q.DetailID)
		if err != nil {
			return err
		}

		for _, opt := range options {

			examOpt := models.ExamQuestionOption{
				ExamQuestionID: examQ.ID,
				Label:          opt.Label,
				OptionText:     opt.Text,
				IsCorrect:      opt.IsCorrect,
			}

			if err := s.db.Create(&examOpt).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
func (s *examService) GetExamQuestions(examID uint) ([]models.ExamQuestion, error) {
	return s.repo.GetExamQuestions(examID)
}

func (s *examService) AssignClass(examID uint, req models.AssignClassRequest) error {

	if len(req.ClassIDs) == 0 {
		return errors.New("no class selected")
	}

	tx := s.db.Begin()

	// ================= INSERT trexamclass =================
	var examClasses []models.ExamClass

	for _, classID := range req.ClassIDs {
		examClasses = append(examClasses, models.ExamClass{
			ExamID:  examID,
			ClassID: classID,
			CreatedDate: time.Now(),
		})
	}

	if err := tx.Create(&examClasses).Error; err != nil {
		tx.Rollback()
		return err
	}

	// ================= GET STUDENT =================
	students, err := s.classMemberRepo.GetStudentsByClassIDs(tx, req.ClassIDs)
	if err != nil {
		tx.Rollback()
		return err
	}

	// ⭐ Prevent empty slice crash
	if len(students) == 0 {
		tx.Commit()
		return nil
	}

	// ================= SNAPSHOT PARTICIPANT =================
	var participants []models.ExamParticipant

	for _, student := range students {

		participants = append(participants, models.ExamParticipant{
			ExamID:        examID,
			StudentID:     student.StudentID,
			StudentName:   student.StudentName,
			StudentNumber: student.StudentNumber,
			ClassID:       student.ClassID,
			Status:        "NotStarted",
			CreatedDate:   time.Now(),
		})
	}

	if err := tx.Create(&participants).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *examService) GetAssignedClasses(examID uint) ([]models.AssignedClassDTO, error) {
	return s.repo.GetAssignedClasses(examID)
}
func (s *examService) GetParticipants(examID uint) ([]models.ExamParticipantDTO, error) {
	return s.repo.GetParticipants(examID)
}
func (s *examService) PublishExam(examID uint) error {

	exam, err := s.repo.GetByID(examID)
	if err != nil {
		return err
	}

	// ================= VALIDATION =================

	if exam.Status == "Published" {
		return errors.New("exam already published")
	}

	if exam.Status == "Deleted" {
		return errors.New("exam already deleted")
	}

	// --- Check Question Snapshot
	qCount, err := s.repo.CountExamQuestions(examID)
	if err != nil {
		return err
	}

	if qCount == 0 {
		return errors.New("exam has no questions")
	}

	// --- Check Schedule
	hasSchedule, err := s.repo.HasSchedule(examID)
	if err != nil {
		return err
	}

	if !hasSchedule {
		return errors.New("exam schedule not found")
	}

	// ================= ACTION =================

	return s.repo.PublishExam(examID)
}

