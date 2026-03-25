package services

import (
	"errors"
	"fmt"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
	"time"
)

type StudentService interface {
	GetDashboard(studentID int) (*models.StudentDashboardResponse, error)
	JoinExam(studentID int, examID int) error
	GetExamQuestions(userID int, examID int) ([]models.ExamQuestion, error)
	SubmitExam(userID int, examID int, answers map[uint]uint) error

}

type studentService struct {
	repo      *repository.StudentRepository
	siswaRepo repository.SiswaRepository
}

func NewStudentService(
	repo *repository.StudentRepository,
	siswaRepo repository.SiswaRepository,
) StudentService {
	return &studentService{
		repo:      repo,
		siswaRepo: siswaRepo,
	}
}

func (s *studentService) JoinExam(userID int, examID int) error {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return err
	}

	participant, err := s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return errors.New("kamu bukan peserta ujian")
	}

	schedule, err := s.repo.GetExamSchedule(examID)
	if err != nil {
		return err
	}

	now := time.Now() // kita pakai ini dulu
	// nanti bisa upgrade timezone

	if now.Before(schedule.StartTime) {
		return errors.New("ujian belum dimulai")
	}

	if now.After(schedule.EndTime) {
		return errors.New("ujian sudah selesai")
	}

	if participant.Status == "NotStarted" {
		err = s.repo.UpdateParticipantStatus(int(participant.ID), "InProgress")

		if err != nil {
			return err
		}
	}

	return nil
}

func (s *studentService) GetExamQuestions(userID int, examID int) ([]models.ExamQuestion, error) {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	_, err = s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return nil, errors.New("kamu bukan peserta ujian")
	}

	return s.repo.GetExamQuestions(examID)
}

func (s *studentService) SubmitExam(userID int, examID int, answers map[uint]uint) error {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return err
	}

	participant, err := s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return err
	}

	totalScore := 0
	maxScore := 0

	for questionID, optionID := range answers {

		// 🔥 insert answer
		err := s.repo.InsertAnswer(participant.ID, questionID, optionID)
		if err != nil {
			return err
		}

		score, correct, err := s.repo.CheckAnswer(optionID)
		if err != nil {
			return err
		}

		maxScore += score

		if correct {
			totalScore += score
		}
	}

	finalScore := float64(totalScore) / float64(maxScore) * 100

	return s.repo.FinishExam(participant.ID, finalScore)
}



func (s *studentService) GetDashboard(userID int) (*models.StudentDashboardResponse, error) {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	fmt.Println("USER ID :", userID)
	fmt.Println("STUDENT ID :", studentID)

	if err != nil {
		return nil, err
	}

	exams, err := s.repo.GetStudentExams(studentID)
	if err != nil {
		return nil, err
	}

	total := 0
	pending := 0
	completed := 0

	now := time.Now()

	for i := range exams {

		total++

		switch exams[i].ParticipantStatus {

		case "NotStarted":

			if now.Before(exams[i].StartTime) {
				exams[i].Status = "scheduled"
				pending++
			} else if now.After(exams[i].EndTime) {
				exams[i].Status = "expired"
			} else {
				exams[i].Status = "ready"
				pending++
			}

		case "InProgress":
			exams[i].Status = "active"

		case "Finished":
			exams[i].Status = "finished"
			completed++
		}

	}

	return &models.StudentDashboardResponse{
		Summary: models.StudentDashboardSummary{
			TotalExam:     total,
			PendingExam:   pending,
			CompletedExam: completed,
		},
		Exams: exams,
	}, nil

}
