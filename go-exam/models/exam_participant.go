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

	Score         float64    `gorm:"column:score"`
	StartTime     *time.Time `gorm:"column:starttime"`
	FinishTime    *time.Time `gorm:"column:finishtime"`

	CreatedDate time.Time `gorm:"column:createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate"`
}

func (ExamParticipant) TableName() string {
	return "trexamparticipant"
}
