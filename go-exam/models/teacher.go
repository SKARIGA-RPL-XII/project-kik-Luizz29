package models

import "time"

type Teacher struct {
	TeacherID   uint      `json:"teacherid" gorm:"column:teacherid;primaryKey"`
	TeacherNm   string    `json:"teachernm" gorm:"column:teachernm"`
	UserID      uint      `json:"userid" gorm:"column:userid"`
	SubjectID  uint      `json:"subjectid" gorm:"column:subjectid"`
	CreatedDate time.Time `json:"created_date" gorm:"column:createddate;autoCreateTime"`
	UpdatedDate time.Time `json:"updated_date" gorm:"column:updateddate;autoUpdateTime"`
	IsActive    bool      `json:"isactive" gorm:"column:isactive"`
}

func (Teacher) TableName() string {
	return "msteacher"
}