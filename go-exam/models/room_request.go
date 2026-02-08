package models

type CreateRoomRequest struct {
	RoomNm   string `json:"roomnm" binding:"required"`
	IsActive bool   `json:"isactive"`
}

type UpdateRoomRequest struct {
	RoomNm   string `json:"roomnm"`
	IsActive *bool  `json:"isactive"`
}
