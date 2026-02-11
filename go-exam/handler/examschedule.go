package handler

import (
	"net/http"
	"strconv"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
)

type ExamScheduleHandler struct {
	service services.ExamScheduleService
}

func NewExamScheduleHandler(service services.ExamScheduleService) *ExamScheduleHandler {
	return &ExamScheduleHandler{service}
}
func (h *ExamScheduleHandler) Create(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, _ := strconv.Atoi(examIdParam)

	var req models.CreateExamScheduleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.CreateSchedule(uint(examId), req)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "schedule created"})
}

func (h *ExamScheduleHandler) GetByExamId(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, _ := strconv.Atoi(examIdParam)

	schedule, err := h.service.GetByExamId(uint(examId))

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

func (h *ExamScheduleHandler) Update(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, _ := strconv.Atoi(examIdParam)

	var req models.CreateExamScheduleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.UpdateSchedule(uint(examId), req)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "schedule updated"})
}
