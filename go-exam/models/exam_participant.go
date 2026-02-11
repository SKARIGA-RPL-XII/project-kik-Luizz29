package models

import "time"

type ExamParticipant struct {
	ID            uint       `gorm:"primaryKey"`
	ExamID        uint       `gorm:"column:examid"`
	StudentID     uint       `gorm:"column:studentid"`
	StudentName   string     `gorm:"column:studentname"`
	StudentNumber string     `gorm:"column:studentnumber"`
	ClassID       uint       `gorm:"column:classid"`
	Status        string     `gorm:"column:status"`

	CreatedDate time.Time `gorm:"column:createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate"`
}

func (ExamParticipant) TableName() string {
	return "trexamparticipant"
}
