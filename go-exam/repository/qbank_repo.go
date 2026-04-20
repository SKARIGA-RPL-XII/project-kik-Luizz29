package repository

import (
	"errors"

	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type QuestionBankRepository interface {
	GetAll() ([]models.QuestionBankHeader, error)
	GetMyBanks(userID uint) ([]models.QuestionBankHeader, error)
	GetTeacher(userID uint) (*models.Teacher, error)
	GetByID(id uint) (*models.QuestionBankHeader, error)
	Create(data *models.QuestionBankHeader) error
	Delete(userID uint, id uint) error
}

type questionBankRepository struct {
	db *gorm.DB
}

func NewQuestionBankRepository(db *gorm.DB) QuestionBankRepository {
	return &questionBankRepository{db}
}

func (r *questionBankRepository) GetAll() ([]models.QuestionBankHeader, error) {
	var data []models.QuestionBankHeader

	err := r.db.Preload("Details").Find(&data).Error
	return data, err
}

func (r *questionBankRepository) GetMyBanks(userID uint) ([]models.QuestionBankHeader, error) {
	var data []models.QuestionBankHeader

	var teacher models.Teacher
	if err := r.db.Where("userid = ?", userID).First(&teacher).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return []models.QuestionBankHeader{}, nil
		}
		return nil, err
	}

	err := r.db.Preload("Details").Where("teacherid = ?", teacher.TeacherID).Find(&data).Error
	return data, err
}

func (r *questionBankRepository) GetTeacher(userID uint) (*models.Teacher, error) {
	var teacher models.Teacher
	if err := r.db.Where("userid = ?", userID).First(&teacher).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("teacher profile not found for this user")
		}
		return nil, err
	}
	return &teacher, nil
}

func (r *questionBankRepository) GetByID(id uint) (*models.QuestionBankHeader, error) {
	var data models.QuestionBankHeader
	err := r.db.Preload("Details").First(&data, id).Error
	return &data, err
}

func (r *questionBankRepository) Create(data *models.QuestionBankHeader) error {
	return r.db.Create(data).Error
}

func (r *questionBankRepository) Delete(userID uint, id uint) error {
	var teacher models.Teacher
	if err := r.db.Where("userid = ?", userID).First(&teacher).Error; err != nil {
		return err
	}

	return r.db.Where("headerid = ? AND teacherid = ?", id, teacher.TeacherID).Delete(&models.QuestionBankHeader{}).Error
}
