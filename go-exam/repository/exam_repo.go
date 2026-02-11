package repository

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type ExamRepository interface {
	Create(exam *models.ExamHd) error
	GetAll() ([]models.ExamHd, error)
	GetByID(id uint) (*models.ExamHd, error)
	Update(exam *models.ExamHd) error
	Delete(id uint) error
	SetBank(examID uint, bankID uint) error
	GetExamQuestions(examID uint) ([]models.ExamQuestion, error)
	BulkInsertExamClass(data []models.ExamClass) error
	BulkInsertParticipant(data []models.ExamParticipant) error
	GetAssignedClasses(examID uint) ([]models.AssignedClassDTO, error)
	GetParticipants(examID uint) ([]models.ExamParticipantDTO, error)
	CountExamQuestions(examID uint) (int64, error)
	HasSchedule(examID uint) (bool, error)
	PublishExam(examID uint) error
}

type examRepository struct {
	db *gorm.DB
}

func NewExamRepository(db *gorm.DB) ExamRepository {
	return &examRepository{db}
}

func (r *examRepository) Create(exam *models.ExamHd) error {
	return r.db.Create(exam).Error
}
func (r *examRepository) GetAll() ([]models.ExamHd, error) {

	var exams []models.ExamHd

	err := r.db.Where("status <> ?", "Deleted").
		Find(&exams).Error

	return exams, err
}

func (r *examRepository) GetByID(id uint) (*models.ExamHd, error) {

	var exam models.ExamHd

	err := r.db.First(&exam, id).Error
	if err != nil {
		return nil, err
	}

	return &exam, nil
}

func (r *examRepository) Update(exam *models.ExamHd) error {
	return r.db.Save(exam).Error
}

func (r *examRepository) Delete(id uint) error {

	return r.db.Model(&models.ExamHd{}).
		Where("id = ?", id).
		Update("status", "Deleted").Error
}

func (r *examRepository) SetBank(examID uint, bankID uint) error {

	return r.db.Model(&models.ExamHd{}).
		Where("id = ?", examID).
		Update("questionbankid", bankID).Error
}

func (r *examRepository) GetExamQuestions(examID uint) ([]models.ExamQuestion, error) {

	var questions []models.ExamQuestion

	err := r.db.
		Preload("Options"). // ← load jawaban
		Where("examid = ?", examID).
		Order("id ASC").
		Find(&questions).Error

	return questions, err
}
func (r *examRepository) BulkInsertExamClass(data []models.ExamClass) error {
	return r.db.Create(&data).Error
}

func (r *examRepository) BulkInsertParticipant(data []models.ExamParticipant) error {
	return r.db.Create(&data).Error
}
func (r *examRepository) GetAssignedClasses(examID uint) ([]models.AssignedClassDTO, error) {

	var result []models.AssignedClassDTO

	err := r.db.Raw(`
SELECT 
    c.classid as classid,
    c.classnm,
    COUNT(p.id) as totalstudent
FROM trexamclass ec
JOIN msclass c ON c.classid = ec.classid
LEFT JOIN trexamparticipant p 
    ON p.classid = ec.classid
    AND p.examid = ec.examid
WHERE ec.examid = ?
GROUP BY c.classid, c.classnm

`, examID).Scan(&result).Error

	return result, err
}

func (r *examRepository) GetParticipants(examID uint) ([]models.ExamParticipantDTO, error) {

	var result []models.ExamParticipantDTO

	err := r.db.Raw(`
		SELECT 
			p.studentid,
			p.studentname,
			p.studentnumber,
			c.classnm,
			p.status
		FROM trexamparticipant p
		JOIN msclass c ON c.classid = p.classid
		WHERE p.examid = ?
		ORDER BY p.studentname
	`, examID).Scan(&result).Error

	return result, err
}
func (r *examRepository) CountExamQuestions(examID uint) (int64, error) {

	var count int64

	err := r.db.
		Table("trexamquestion").
		Where("examid = ?", examID).
		Count(&count).Error

	return count, err
}

func (r *examRepository) HasSchedule(examID uint) (bool, error) {

	var count int64

	err := r.db.
		Table("trexamschedule").
		Where("examid = ?", examID).
		Count(&count).Error

	return count > 0, err
}

func (r *examRepository) PublishExam(examID uint) error {

	return r.db.Model(&models.ExamHd{}).
		Where("id = ?", examID).
		Update("status", "Published").Error
}
