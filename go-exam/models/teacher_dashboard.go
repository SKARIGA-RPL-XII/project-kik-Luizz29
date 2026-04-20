package models

type TeacherDashboardStats struct {
	TotalAssignedExams int64 `json:"total_assigned_exams"`
	ActiveExams        int64 `json:"active_exams"`
	TotalQuestions     int64 `json:"total_questions"`
	TotalStudents      int64 `json:"total_students"`
}

type TeacherRecentActivity struct {
	ID        uint   `json:"id"`
	Action    string `json:"action"`
	Entity    string `json:"entity"`
	Timestamp string `json:"timestamp"`
}

type TeacherDashboardResponse struct {
	Stats          TeacherDashboardStats   `json:"stats"`
	RecentActivity []TeacherRecentActivity `json:"recent_activity"`
}
