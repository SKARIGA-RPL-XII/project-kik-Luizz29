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

	// Count Assigned Exams
	s.db.Model(&models.ExamHd{}).Where("teacherid = ?", teacher.TeacherID).Count(&stats.TotalAssignedExams)

	// Count Published Exams
	s.db.Model(&models.ExamHd{}).Where("teacherid = ? AND status = ?", teacher.TeacherID, "published").Count(&stats.ActiveExams)

	// Count Questions (Assuming questions are linked to teacher via subject or something, but let's count questions in qbank owned by teacher)
	s.db.Model(&models.Question{}).Joins("join trqbank q on q.id = msquestion.qbankid").Where("q.createdby = ?", userID).Count(&stats.TotalQuestions)

	// Count Students (Assigned to the teacher's classes)
	s.db.Table("mssiswa s").
		Joins("join msclass c on c.id = s.classid").
		Joins("join trexamclass ec on ec.classid = c.id").
		Joins("join trexamhd e on e.id = ec.examid").
		Where("e.teacherid = ?", teacher.TeacherID).
		Distinct("s.id").
		Count(&stats.TotalStudents)

	// Mock Recent Activity
	recentActivity := []models.TeacherRecentActivity{
		{ID: 1, Action: "Created", Entity: "New Question Bank", Timestamp: "1 hour ago"},
		{ID: 2, Action: "Published", Entity: "Ujian Tengah Semester", Timestamp: "3 hours ago"},
		{ID: 3, Action: "Assigned", Entity: "Kelas XII RPL 1", Timestamp: "5 hours ago"},
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
