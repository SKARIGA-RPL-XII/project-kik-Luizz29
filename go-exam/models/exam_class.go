package models

import "time"

type ExamClass struct {
	ID          uint      `gorm:"primaryKey"`
	ExamID      uint      `gorm:"column:examid"`
	ClassID     uint      `gorm:"column:classid"`
	CreatedDate time.Time `gorm:"column:createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate"`
}

func (ExamClass) TableName() string {
	return "trexamclass"
}
