package models

type ExamParticipantDTO struct {
    StudentID uint `json:"studentid" gorm:"column:studentid"`
    StudentName string `json:"studentname" gorm:"column:studentname"`
    StudentNumber string `json:"studentnumber" gorm:"column:studentnumber"`
    ClassNm string `json:"classnm" gorm:"column:classnm"`
    Status string `json:"status" gorm:"column:status"`
}
