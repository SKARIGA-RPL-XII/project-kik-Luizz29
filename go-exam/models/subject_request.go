package models

type CreateSubjectRequest struct {
	SubjectNm   string `json:"subject_nm" binding:"required"`
	SubjectCode string `json:"subject_code" binding:"required"`
}

type UpdateSubjectRequest struct {
	SubjectNm   string `json:"subject_nm"`
	SubjectCode string `json:"subject_code"`
}
