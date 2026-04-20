package models

type TeacherDashboardStats struct {
	TotalAssignedExams int64 `json:"total_assigned_exams"`
	TotalQuestionBanks int64 `json:"total_question_banks"`
	TotalQuestions     int64 `json:"total_questions"`
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
