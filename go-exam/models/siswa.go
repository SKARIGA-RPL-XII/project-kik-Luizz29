package models

import "time"

type Siswa struct {
	SiswaID     uint      `gorm:"column:siswaid;primaryKey" json:"siswaid"`
	UserID      uint      `gorm:"column:userid" json:"userid"`
	ClassID     uint      `gorm:"column:classid" json:"classid"`
	CreatedDate time.Time `gorm:"column:createddate;autoCreateTime" json:"createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate;autoUpdateTime" json:"updateddate"`
	IsActive    bool      `gorm:"column:isactive" json:"isactive"`
}

func (Siswa) TableName() string {
	return "mssiswa"
}
