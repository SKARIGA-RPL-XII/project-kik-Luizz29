package models

import "time"

type ExamSchedule struct {
	ScheduleId uint `gorm:"primaryKey;column:scheduleid"`
	ExamId     uint `gorm:"column:examid"`

	StartTime time.Time `gorm:"column:starttime"`
	EndTime   time.Time `gorm:"column:endtime"`
	Duration  int       `gorm:"column:duration"`

	IsPublished bool `gorm:"column:ispublished"`

	CreatedDate time.Time `gorm:"column:createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate"`
}

func (ExamSchedule) TableName() string {
	return "trexamschedule"
}

type CreateExamScheduleRequest struct {
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

