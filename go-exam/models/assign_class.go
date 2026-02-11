package models

type AssignedClassDTO struct {
    ClassID uint `json:"classid" gorm:"column:classid"`
    ClassNm string `json:"classnm" gorm:"column:classnm"`
    TotalStudent int `json:"totalstudent" gorm:"column:totalstudent"`
}
