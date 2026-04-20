package models

type AdminDashboardStats struct {
	TotalStudents int64 `json:"total_students"`
	ActiveExams   int64 `json:"active_exams"`
	TotalSubjects int64 `json:"total_subjects"`
	TotalTeachers int64 `json:"total_teachers"`
}

type RecentResult struct {
	ID        uint    `json:"id"`
	StudentNm string  `json:"student_nm"`
	ExamNm    string  `json:"exam_nm"`
	Score     float64 `json:"score"`
	Status    string  `json:"status"`
	Date      string  `json:"date"`
}

type AdminDashboardResponse struct {
	Stats         AdminDashboardStats `json:"stats"`
	RecentResults []RecentResult      `json:"recent_results"`
}
