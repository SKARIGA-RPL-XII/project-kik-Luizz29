package services

import (
	"errors"
	"time"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type ExamScheduleService interface {
	CreateSchedule(examId uint, req models.CreateExamScheduleRequest) error
	GetByExamId(examId uint) (*models.ExamSchedule, error)
	UpdateSchedule(examId uint, req models.CreateExamScheduleRequest) error
}

type examScheduleService struct {
	repo repository.ExamScheduleRepository
}

func parseWIBTime(value string) (time.Time, error) {

	layout := "2006-01-02 15:04:05"

	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Time{}, err
	}

	return time.ParseInLocation(layout, value, loc)
}


func NewExamScheduleService(repo repository.ExamScheduleRepository) ExamScheduleService {
	return &examScheduleService{repo}
}

func (s *examScheduleService) CreateSchedule(
	examId uint,
	req models.CreateExamScheduleRequest,
) error {

	startTime, err := parseWIBTime(req.StartTime)
	if err != nil {
		return errors.New("invalid startTime format")
	}

	endTime, err := parseWIBTime(req.EndTime)
	if err != nil {
		return errors.New("invalid endTime format")
	}

	if endTime.Before(startTime) {
		return errors.New("endTime must be after startTime")
	}

	existing, err := s.repo.GetByExamId(examId)

	if err == nil && existing != nil {
		return errors.New("schedule already exists")
	}

	loc, _ := time.LoadLocation("Asia/Jakarta")

	schedule := models.ExamSchedule{
		ExamId:      examId,
		StartTime:   startTime,
		EndTime:     endTime,
		Duration:    int(endTime.Sub(startTime).Minutes()),
		IsPublished: false,
		CreatedDate: time.Now().In(loc),
		UpdatedDate: time.Now().In(loc),
	}

	return s.repo.Create(&schedule)
}



func (s *examScheduleService) GetByExamId(examId uint) (*models.ExamSchedule, error) {
	return s.repo.GetByExamId(examId)
}

func (s *examScheduleService) UpdateSchedule(
	examId uint,
	req models.CreateExamScheduleRequest,
) error {

	startTime, err := parseWIBTime(req.StartTime)
	if err != nil {
		return errors.New("invalid startTime format")
	}

	endTime, err := parseWIBTime(req.EndTime)
	if err != nil {
		return errors.New("invalid endTime format")
	}

	if endTime.Before(startTime) {
		return errors.New("endTime must be after startTime")
	}

	schedule, err := s.repo.GetByExamId(examId)
	if err != nil {
		return err
	}

	loc, _ := time.LoadLocation("Asia/Jakarta")

	schedule.StartTime = startTime
	schedule.EndTime = endTime
	schedule.Duration = int(endTime.Sub(startTime).Minutes())
	schedule.UpdatedDate = time.Now().In(loc)

	return s.repo.Update(schedule)
}

