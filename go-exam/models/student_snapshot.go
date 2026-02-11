package models

type StudentSnapshot struct {
	StudentID     uint   `gorm:"column:studentid"`
	StudentName   string `gorm:"column:studentname"`
	StudentNumber string `gorm:"column:studentnumber"`
	ClassID       uint   `gorm:"column:classid"`
}
