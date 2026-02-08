package models

import "time"

type Teacher struct {
	TeacherID   uint      `json:"teacher_id" gorm:"column:teacherid;primaryKey"`
	TeacherNm   string    `json:"teacher_nm"`
	UserID      uint      `json:"user_id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	IsActive    bool      `json:"is_active"`
}

func (Teacher) TableName() string {
	return "msteacher"
}
