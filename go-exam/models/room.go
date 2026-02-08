package models

import "time"

type Room struct {
	RoomID      uint      `gorm:"column:roomid;primaryKey" json:"roomid"`
	RoomNm      string    `gorm:"column:roomnm" json:"roomnm"`
	CreatedDate time.Time `gorm:"column:createddate;autoCreateTime" json:"createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate;autoUpdateTime" json:"updateddate"`
	IsActive    bool      `gorm:"column:isactive" json:"isactive"`
}

func (Room) TableName() string {
	return "msroom"
}
