package models

type CreateClassRequest struct {
	ClassNm  string `json:"classnm" binding:"required"`
	IsActive bool   `json:"isactive"`
}

type UpdateClassRequest struct {
	ClassNm  string `json:"classnm"`
	IsActive *bool  `json:"isactive"`
}
