package models

type ExamQuestionOption struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	ExamQuestionID uint   `gorm:"column:examquestionid" json:"examquestionid"`
	Label          string `gorm:"column:label" json:"label"`
	OptionText     string `gorm:"column:optiontext" json:"optiontext"`
	IsCorrect      bool   `gorm:"column:iscorrect" json:"iscorrect"`
}


func (ExamQuestionOption) TableName() string {
	return "trexamquestionoption"
}
