package models

import "time"

type ExamHd struct {
	ID             uint      `gorm:"column:id;primaryKey" json:"id"`
	ExamNm         string    `gorm:"column:examnm" json:"examnm"`
	Description    string    `gorm:"column:description" json:"description"`
	Duration       int       `gorm:"column:duration" json:"duration"`
	Status         string    `gorm:"column:status" json:"status"`
	QuestionBankID *uint     `gorm:"column:questionbankid" json:"questionbankid"`
	CreatedBy      uint      `gorm:"column:createdby" json:"createdby"`
	CreatedDate    time.Time `gorm:"column:createddate" json:"createddate"`
}

func (ExamHd) TableName() string {
	return "trexamhd"
}

type ExamRequest struct {
	ExamNm      string `json:"examnm"`
	Description string `json:"description"`
	Duration    int    `json:"duration"`
}
