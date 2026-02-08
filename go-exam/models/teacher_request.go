package models
type CreateTeacherRequest struct {
	TeacherNm string `json:"teacher_nm" binding:"required"`
	UserID    uint   `json:"user_id"`
	IsActive  bool   `json:"is_active"`
}

type UpdateTeacherRequest struct {
	TeacherNm string `json:"teacher_nm"`
	UserID    uint   `json:"user_id"`
	IsActive  bool   `json:"is_active"`
}
