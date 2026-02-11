package models

type Role struct {
	RoleID uint   `json:"roleid" gorm:"column:roleid;primaryKey"`
	RoleNm string `json:"rolenm" gorm:"column:rolenm"`
}

func (Role) TableName() string {
	return "msrole"
}
