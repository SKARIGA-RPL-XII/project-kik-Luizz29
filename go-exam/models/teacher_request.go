package models

type CreateTeacherRequest struct {
	TeacherNm string `json:"teachernm" gorm:"column:teachernm" binding:"required"`
	UserID    uint   `json:"userid" gorm:"column:userid"`
	SubjectID uint   `json:"subjectid" gorm:"column:subjectid"` // ← TAMBAHAN
	IsActive  bool   `json:"isactive" gorm:"column:isactive"`
}

type UpdateTeacherRequest struct {
	TeacherNm string `json:"teachernm"`
	UserID    uint   `json:"userid"`
	SubjectID uint   `json:"subjectid"` // sebaiknya juga ada
	IsActive  bool   `json:"isactive"`
}