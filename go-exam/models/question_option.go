package models

type QuestionOption struct {
	OptionID  uint   `gorm:"primaryKey;column:optionid" json:"optionid"`
	DetailID  uint   `gorm:"column:detailid" json:"detailid"`
	Label     string `gorm:"column:label" json:"label"`
	Text      string `gorm:"column:text" json:"text"`
	IsCorrect bool   `gorm:"column:iscorrect" json:"iscorrect"`
}

func (QuestionOption) TableName() string {
	return "trquestionoption"
}



type CreateOptionRequest struct {
	Label     string `json:"label" binding:"required"`
	Text      string `json:"text" binding:"required"`
	IsCorrect bool   `json:"iscorrect"`
}
