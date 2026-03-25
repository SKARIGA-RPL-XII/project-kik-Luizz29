package handler

import (
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
	"strconv"
)

type StudentHandler struct {
	service services.StudentService
}

func NewStudentHandler(service services.StudentService) *StudentHandler {
	return &StudentHandler{service}
}

func (h *StudentHandler) GetDashboard(c *gin.Context) {

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userID := int(userIDValue.(uint))

	result, err := h.service.GetDashboard(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, result)
}

func (h *StudentHandler) JoinExam(c *gin.Context) {

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(400, gin.H{"message": "exam id tidak valid"})
		return
	}

	err = h.service.JoinExam(userID, examID)
	if err != nil {
		c.JSON(400, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "allowed"})
}

func (h *StudentHandler) GetExamQuestions(c *gin.Context) {

	userIDVal, _ := c.Get("user_id")
	userID := int(userIDVal.(uint))

	examID, _ := strconv.Atoi(c.Param("examID"))

	result, err := h.service.GetExamQuestions(userID, examID)
	if err != nil {
		c.JSON(400, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, result)
}
func (h *StudentHandler) SubmitExam(c *gin.Context) {

	userIDVal, _ := c.Get("user_id")
	userID := int(userIDVal.(uint))

	examID, _ := strconv.Atoi(c.Param("examID"))

	var req models.SubmitExamRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "invalid payload"})
		return
	}

	err := h.service.SubmitExam(userID, examID, req.Answers)
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "submitted"})
}
