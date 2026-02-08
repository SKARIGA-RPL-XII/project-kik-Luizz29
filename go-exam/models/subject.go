package models

import "time"

type Subject struct {
	SubjectID   uint      `json:"subject_id" gorm:"primaryKey;column:subjectid"`
	SubjectNm   string    `json:"subject_name" gorm:"column:subjectnm"`
	SubjectCode string    `json:"subject_code" gorm:"column:subjectcode"`
	CreatedDate time.Time `json:"created_date" gorm:"column:createddate;autoCreateTime"`

}

func (Subject) TableName() string {
	return "mssubject"
}
