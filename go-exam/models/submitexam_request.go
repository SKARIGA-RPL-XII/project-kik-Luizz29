package models

type SubmitExamRequest struct {
	Answers map[uint]uint `json:"answers"`
}
type ExamAnswer struct {
	ID uint `gorm:"primaryKey"`

	ParticipantID uint `gorm:"column:participantid"`
	ExamQuestionID uint `gorm:"column:examquestionid"`
	OptionID uint `gorm:"column:optionid"`
}
func (ExamAnswer) TableName() string {
	return "trexamanswer"
}