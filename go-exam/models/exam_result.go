package models

type ExamResultResponse struct {
	ExamTitle string               `json:"exam_title"`
	Score     float64              `json:"score"`
	Questions []ExamResultQuestion `json:"questions"`
}

type ExamResultQuestion struct {
	QuestionID   uint               `json:"id"`
	QuestionText string             `json:"question_text"`
	Options      []ExamResultOption `json:"options"`
}

type ExamResultOption struct {
	OptionID       uint   `json:"id"`
	OptionText     string `json:"option_text"`
	IsCorrect      bool   `json:"is_correct"`
	IsUserSelected bool   `json:"is_user_selected"`
}
