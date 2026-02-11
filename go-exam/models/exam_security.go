package models

import "time"

type ExamSecurity struct {
	SecurityId uint `gorm:"primaryKey;column:securityid" json:"securityid"`
	ExamId     uint `gorm:"column:examid" json:"examid"`

	EnableIpCheck  bool   `gorm:"column:enableipcheck" json:"enableipcheck"`
	AllowedNetwork string `gorm:"column:allowednetwork" json:"allowednetwork"`

	EnableGeolocation bool    `gorm:"column:enablegeolocation" json:"enablegeolocation"`
	Latitude          float64 `gorm:"column:latitude" json:"latitude"`
	Longitude         float64 `gorm:"column:longitude" json:"longitude"`
	RadiusMeter       int     `gorm:"column:radiusmeter" json:"radiusmeter"`

	CreatedDate time.Time `gorm:"column:createddate" json:"createddate"`
	UpdatedDate time.Time `gorm:"column:updateddate" json:"updateddate"`
}


func (ExamSecurity) TableName() string {
	return "trexamsecurity"
}

type CreateExamSecurityRequest struct {
	EnableIpCheck     bool    `json:"enableipcheck"`
	AllowedNetwork    string  `json:"allowednetwork"`

	EnableGeolocation bool    `json:"enablegeolocation"`
	Latitude          float64 `json:"latitude"`
	Longitude         float64 `json:"longitude"`
	RadiusMeter       int     `json:"radiusmeter"`
}
