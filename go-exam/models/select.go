package models

type SelectUser struct {
	UserID   uint   `json:"userid" gorm:"column:userid"`
	Username string `json:"username" gorm:"column:username"`
}

type SelectClass struct {
	ClassID uint   `json:"classid" gorm:"column:classid"`
	ClassNm string `json:"classnm" gorm:"column:classnm"`
}

type SelectRole struct {
	RoleID uint   `json:"roleid" gorm:"column:roleid;primaryKey"`
	RoleNm string `json:"rolenm" gorm:"column:rolenm"`
}

type SelectSubject struct {
	SubjectID uint   `json:"subjectid" gorm:"column:subjectid"`
	SubjectNm string `json:"subjectnm" gorm:"column:subjectnm"`
}

