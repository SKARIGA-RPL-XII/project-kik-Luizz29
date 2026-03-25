package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
	"time"
)

type StudentRepository struct {
	db *gorm.DB
}

func NewStudentRepository(db *gorm.DB) *StudentRepository {
	return &StudentRepository{db}
}

func (r *StudentRepository) GetStudentExams(studentID int) ([]models.StudentDashboardExam, error) {

	var exams []models.StudentDashboardExam

	err := r.db.
		Table("trexamparticipant p").
		Select(`
    h.id as id,
    h.examnm as title,
    s.starttime as start_time,
    s.endtime as end_time,
    p.status as participant_status
`).
		Joins("JOIN trexamhd h ON h.id = p.examid").
		Joins("JOIN trexamschedule s ON s.examid = h.id").
		Where("p.studentid = ?", studentID).
		Where("h.status = ?", "Published").
		Order("s.starttime ASC").
		Scan(&exams).Error

	if err != nil {
		return nil, err
	}

	return exams, nil
}

func (r *StudentRepository) GetParticipant(studentID, examID int) (*models.ExamParticipant, error) {

	var p models.ExamParticipant

	err := r.db.
		Table("trexamparticipant").
		Where("studentid = ? AND examid = ?", studentID, examID).
		First(&p).Error

	return &p, err
}

func (r *StudentRepository) GetExamSchedule(examID int) (*models.ExamSchedule, error) {

	var s models.ExamSchedule

	err := r.db.
		Table("trexamschedule").
		Where("examid = ?", examID).
		First(&s).Error

	return &s, err
}
func (r *StudentRepository) UpdateParticipantStatus(id int, status string) error {

	return r.db.
		Table("trexamparticipant").
		Where("id = ?", id).
		Update("status", status).Error
}
func (r *StudentRepository) GetExamQuestions(examID int) ([]models.ExamQuestion, error) {

	var questions []models.ExamQuestion

	err := r.db.
		Where("examid = ?", examID).
		Preload("Options").
		Order("id ASC").
		Find(&questions).Error

	if err != nil {
		return nil, err
	}

	return questions, nil
}
func (r *StudentRepository) InsertAnswer(participantID uint, questionID uint, optionID uint) error {

	answer := models.ExamAnswer{
		ParticipantID:  participantID,
		ExamQuestionID: questionID,
		OptionID:       optionID,
	}

	return r.db.Create(&answer).Error
}
func (r *StudentRepository) CheckAnswer(optionID uint) (int, bool, error) {

	var opt models.ExamQuestionOption

	err := r.db.First(&opt, optionID).Error
	if err != nil {
		return 0, false, err
	}

	var question models.ExamQuestion
	r.db.First(&question, opt.ExamQuestionID)

	return question.Score, opt.IsCorrect, nil
}

func (r *StudentRepository) FinishExam(participantID uint, score float64) error {

	return r.db.Model(&models.ExamParticipant{}).
		Where("id = ?", participantID).
		Updates(map[string]interface{}{
			"status":     "Finished",
			"score":      score,
			"finishtime": time.Now(),
		}).Error
}
