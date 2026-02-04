package models

type CreateSiswaRequest struct {
	UserID   uint `json:"userid" binding:"required"`
	ClassID  uint `json:"classid" binding:"required"`
	IsActive bool `json:"isactive"`
}

type UpdateSiswaRequest struct {
	ClassID  *uint `json:"classid"`
	IsActive *bool `json:"isactive"`
}
