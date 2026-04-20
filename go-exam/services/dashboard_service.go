package services

import (
	"github.com/Luizz29/go-gin-project/models"
	"gorm.io/gorm"
)

type DashboardService interface {
	GetAdminStats() (*models.AdminDashboardResponse, error)
	GetTeacherStats(userID uint) (*models.TeacherDashboardResponse, error)
}

type dashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{db}
}

func (s *dashboardService) GetTeacherStats(userID uint) (*models.TeacherDashboardResponse, error) {
	var stats models.TeacherDashboardStats
	var teacher models.Teacher

	// Get Teacher Info from UserID
	if err := s.db.Where("userid = ?", userID).First(&teacher).Error; err != nil {
		return nil, err
	}

	// 1. Count Assigned Exams (Exams where teacherid is assigned)
	s.db.Model(&models.ExamHd{}).Where("teacherid = ?", teacher.TeacherID).Count(&stats.TotalAssignedExams)

	// 2. Count Total Question Banks (Banks created by this teacher)
	s.db.Model(&models.QuestionBankHeader{}).Where("teacherid = ?", teacher.TeacherID).Count(&stats.TotalQuestionBanks)

	// 3. Count Total Questions (Questions inside banks created by this teacher)
	s.db.Table("trquestionbankdt").
		Joins("join trquestionbankhd on trquestionbankhd.headerid = trquestionbankdt.headerid").
		Where("trquestionbankhd.teacherid = ?", teacher.TeacherID).
		Count(&stats.TotalQuestions)

	// Mock Recent Activity
	recentActivity := []models.TeacherRecentActivity{
		{ID: 1, Action: "Dibuat", Entity: "Bank Soal Baru", Timestamp: "Baru saja"},
		{ID: 2, Action: "Ditugaskan", Entity: "Ujian Akhir Semester", Timestamp: "Hari ini"},
	}

	return &models.TeacherDashboardResponse{
		Stats:          stats,
		RecentActivity: recentActivity,
	}, nil
}

func (s *dashboardService) GetAdminStats() (*models.AdminDashboardResponse, error) {
	var stats models.AdminDashboardStats

	// Count Siswa
	s.db.Model(&models.Siswa{}).Count(&stats.TotalStudents)

	// Count Teachers
	s.db.Model(&models.Teacher{}).Count(&stats.TotalTeachers)

	// Count Subjects
	s.db.Model(&models.Subject{}).Count(&stats.TotalSubjects)

	// Count Active Exams
	s.db.Model(&models.ExamHd{}).Where("status = ?", "published").Count(&stats.ActiveExams)

	// Get Recent Results (mocking for now or using ExamParticipant if score exists)
	// Let's assume ExamParticipant has score
	var recentResults []models.RecentResult
	rows, err := s.db.Table("trexamparticipant p").
		Select("p.id, s.siswanm as student_nm, e.examnm as exam_nm, p.score, 'Passed' as status, '2 mins ago' as date").
		Joins("join mssiswa s on s.id = p.siswaid").
		Joins("join trexamhd e on e.id = p.examid").
		Order("p.id desc").
		Limit(5).
		Rows()
	
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var res models.RecentResult
			rows.Scan(&res.ID, &res.StudentNm, &res.ExamNm, &res.Score, &res.Status, &res.Date)
			recentResults = append(recentResults, res)
		}
	}

	return &models.AdminDashboardResponse{
		Stats:         stats,
		RecentResults: recentResults,
	}, nil
}
