package models

import "time"

type Class struct {
	ClassID     uint      `json:"classid" gorm:"column:classid;primaryKey"`
	ClassNm     string    `json:"classnm" gorm:"column:classnm"`
	CreatedDate time.Time `json:"createddate" gorm:"column:createddate;autoCreateTime"`
	UpdatedDate time.Time `json:"updateddate" gorm:"column:updateddate;autoUpdateTime"`
	IsActive    bool      `json:"isactive" gorm:"column:isactive"`
}

func (Class) TableName() string {
	return "msclass"
}
