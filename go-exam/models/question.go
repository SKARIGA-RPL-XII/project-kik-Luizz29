package models

type Question struct {
	DetailID uint   `gorm:"primaryKey;column:detailid" json:"detailid"`
	HeaderID uint   `gorm:"column:headerid" json:"headerid"`
	Question string `gorm:"column:question" json:"question"`
	Type     string `gorm:"column:type" json:"type"`
	Score    int    `gorm:"column:score" json:"score"`

	Options []QuestionOption `gorm:"foreignKey:DetailID" json:"options"`
}

func (Question) TableName() string {
	return "trquestionbankdt"
}

type CreateQuestionRequest struct {
	Question string          `json:"question" binding:"required"`
	Type     string          `json:"type" binding:"required"`
	Score    int             `json:"score"`
	Options  []OptionRequest `json:"options"` 
}

type UpdateQuestionRequest struct {
	Question string `json:"question"`
	Type     string `json:"type"`
	Score    int    `json:"score"`
}

type OptionRequest struct {
	Label     string `json:"label"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"iscorrect"`
}
