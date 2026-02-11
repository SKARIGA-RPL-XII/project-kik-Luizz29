package models

import "time"

type QuestionBankHeader struct {
	HeaderID    uint      `gorm:"primaryKey;column:headerid" json:"headerid"`
	Title       string    `gorm:"column:title" json:"title"`
	SubjectID   uint      `gorm:"column:subjectid" json:"subjectid"`
	TeacherID   uint      `gorm:"column:teacherid" json:"teacherid"`
	Description string    `gorm:"column:description" json:"description"`
	CreatedDate time.Time `gorm:"column:createddate" json:"createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate" json:"updateddate"`

	Details []QuestionBankDetail `gorm:"foreignKey:HeaderID;references:HeaderID" json:"details"`
}

func (QuestionBankHeader) TableName() string {
	return "trquestionbankhd"
}

type QuestionBankDetail struct {
	DetailID uint   `gorm:"primaryKey;column:detailid" json:"detailid"`
	HeaderID uint   `gorm:"column:headerid" json:"headerid"`
	Question string `gorm:"column:question" json:"question"`
	Type     string `gorm:"column:type" json:"type"`
	Score    int    `gorm:"column:score" json:"score"`
}

func (QuestionBankDetail) TableName() string {
	return "trquestionbankdt"
}

type CreateQuestionBankRequest struct {
	Title       string `json:"title" binding:"required"`
	SubjectID   uint   `json:"subjectid" binding:"required"`
	TeacherID   uint   `json:"teacherid" binding:"required"`
	Description string `json:"description"`

	Details []CreateQuestionDetailRequest `json:"details"`
}

type CreateQuestionDetailRequest struct {
	Question string `json:"question"`
	Type     string `json:"type"`
	Score    int    `json:"score"`
}
