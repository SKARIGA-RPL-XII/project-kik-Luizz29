package services

import (
	"errors"
	"fmt"
	"math"
	"net"
	"strings"
	"time"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/repository"
)

type StudentService interface {
	GetDashboard(studentID int) (*models.StudentDashboardResponse, error)
	JoinExam(studentID int, examID int, lat float64, lon float64, ip string) error
	ValidateSecurity(userID int, examID int, lat float64, lon float64, clientIP string) error
	GetExamQuestions(userID int, examID int) ([]models.ExamQuestion, error)
	SubmitExam(userID int, examID int, answers map[uint]uint, lat float64, lon float64, clientIP string) error
	GetExamResult(userID int, examID int) (*models.ExamResultResponse, error)
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

func (s *studentService) JoinExam(userID int, examID int, lat float64, lon float64, clientIP string) error {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return err
	}

	participant, err := s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return errors.New("kamu bukan peserta ujian")
	}

	// SECURITY VALIDATION CORE
	err = s.ValidateSecurity(userID, examID, lat, lon, clientIP)
	if err != nil {
		return err
	}

	schedule, err := s.repo.GetExamSchedule(examID)
	if err != nil {
		return err
	}

	now := time.Now()
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

func (s *studentService) ValidateSecurity(userID int, examID int, lat float64, lon float64, clientIP string) error {
	security, secErr := s.repo.GetExamSecurity(examID)
	if secErr == nil && security != nil { // if security rules exist
		if security.EnableIpCheck {
			allowed := strings.TrimSpace(security.AllowedNetwork)
			if allowed != "" {
				isMatched := false
				if strings.Contains(allowed, "/") {
					_, ipv4Net, err := net.ParseCIDR(allowed)
					if err == nil {
						ip := net.ParseIP(clientIP)
						isMatched = ipv4Net.Contains(ip)
					}
				} else {
					isMatched = (clientIP == allowed)
				}
				if !isMatched {
					return errors.New("Akses ditolak: IP kamu tidak masuk dalam jaringan izin ujian ini. (Terdeteksi IP: " + clientIP + ")")
				}
			}
		}

		if security.EnableGeolocation {
			if lat == 0 && lon == 0 {
				return errors.New("Akses ditolak: Lokasi GPS tidak dapat dideteksi. Pastikan kamu mengizinkan akses lokasi pada browser.")
			}
			earthRadius := 6371000.0
			lat1Rad := lat * math.Pi / 180
			lon1Rad := lon * math.Pi / 180
			lat2Rad := security.Latitude * math.Pi / 180
			lon2Rad := security.Longitude * math.Pi / 180

			dLat := lat2Rad - lat1Rad
			dLon := lon2Rad - lon1Rad

			a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dLon/2)*math.Sin(dLon/2)
			c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

			distance := earthRadius * c

			if distance > float64(security.RadiusMeter) {
				return errors.New(fmt.Sprintf("Akses ditolak: Kamu berada di luar radius area ujian (Jarak saat ini: %.0f m, Tersedia: %d m)", distance, security.RadiusMeter))
			}
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

func (s *studentService) SubmitExam(userID int, examID int, answers map[uint]uint, lat float64, lon float64, clientIP string) error {

	err := s.ValidateSecurity(userID, examID, lat, lon, clientIP)
	if err != nil {
		return errors.New("Validasi Keamanan Gagal Saat Submit: " + err.Error())
	}

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return err
	}

	participant, err := s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return err
	}

	// 1. Calculate genuine maxScore based on all exam questions
	questions, err := s.repo.GetExamQuestions(examID)
	if err != nil {
		return err
	}

	maxScore := 0
	for _, q := range questions {
		maxScore += q.Score
	}

	// 2. Process student answers and compile totalScore
	totalScore := 0

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

		if correct {
			totalScore += score
		}
	}

	// 3. Prevent division by zero if exam has strictly 0 maximum points
	finalScore := 0.0
	if maxScore > 0 {
		finalScore = (float64(totalScore) / float64(maxScore)) * 100
	}

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

func (s *studentService) GetExamResult(userID int, examID int) (*models.ExamResultResponse, error) {

	studentID, err := s.siswaRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	participant, err := s.repo.GetParticipant(studentID, examID)
	if err != nil {
		return nil, err
	}

	if participant.Status != "Finished" {
		return nil, errors.New("ujian belum selesai")
	}

	questions, err := s.repo.GetExamQuestions(examID)
	if err != nil {
		return nil, err
	}

	answers, err := s.repo.GetStudentAnswers(participant.ID)
	if err != nil {
		return nil, err
	}

	selectedOptions := make(map[uint]bool)
	for _, ans := range answers {
		selectedOptions[ans.OptionID] = true
	}

	res := models.ExamResultResponse{
		Score: participant.Score,
	}

	for _, q := range questions {
		var resQ models.ExamResultQuestion
		resQ.QuestionID = q.ID
		resQ.QuestionText = q.Question

		for _, o := range q.Options {
			resQ.Options = append(resQ.Options, models.ExamResultOption{
				OptionID:       o.ID,
				OptionText:     o.OptionText,
				IsCorrect:      o.IsCorrect,
				IsUserSelected: selectedOptions[o.ID],
			})
		}
		res.Questions = append(res.Questions, resQ)
	}

	return &res, nil
}
