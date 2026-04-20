package models

import "time"

type ExamQuestion struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	ExamID   uint   `gorm:"column:examid" json:"examid"`
	Question string `gorm:"column:question" json:"question"`
	Type     string `gorm:"column:type" json:"type"`
	Score    int    `gorm:"column:score" json:"score"`

	Options []ExamQuestionOption `gorm:"foreignKey:ExamQuestionID" json:"options"`
}


func (ExamQuestion) TableName() string {
	return "trexamquestion"
}

type ExamQuestionsResponse struct {
	Questions []ExamQuestion `json:"questions"`
	Duration  int            `json:"duration"`
	StartTime *time.Time     `json:"start_time"`
}
