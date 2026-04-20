package models

import "time"

type StudentDashboardSummary struct {
	TotalExam     int `json:"total_exam"`
	PendingExam   int `json:"pending_exam"`
	CompletedExam int `json:"completed_exam"`
}

type StudentDashboardExam struct {
	ID int `json:"id" gorm:"column:id"`

	Title string `json:"title" gorm:"column:title"`

	StartTime time.Time `json:"start_time" gorm:"column:start_time"`

	EndTime time.Time `json:"end_time" gorm:"column:end_time"`
	Duration int `json:"duration" gorm:"column:duration"`

	Status string `json:"status" gorm:"-"`

	ParticipantStatus string `json:"-" gorm:"column:participant_status"`
}

type StudentDashboardResponse struct {
	Summary StudentDashboardSummary `json:"summary"`
	Exams   []StudentDashboardExam  `json:"exams"`
}
