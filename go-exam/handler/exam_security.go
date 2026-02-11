package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type ExamSecurityHandler struct {
	service services.ExamSecurityService
}

func NewExamSecurityHandler(service services.ExamSecurityService) *ExamSecurityHandler {
	return &ExamSecurityHandler{service}
}

func (h *ExamSecurityHandler) GetByExamId(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, err := strconv.Atoi(examIdParam)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid exam id"})
		return
	}

	security, err := h.service.GetByExamId(uint(examId))

	if err != nil {
		c.JSON(404, gin.H{"error": "security not found"})
		return
	}

	c.JSON(200, security)
}

func (h *ExamSecurityHandler) Create(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, _ := strconv.Atoi(examIdParam)

	var req models.CreateExamSecurityRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.CreateSecurity(uint(examId), req)

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "security created"})
}

func (h *ExamSecurityHandler) Update(c *gin.Context) {

	examIdParam := c.Param("id")

	examId, _ := strconv.Atoi(examIdParam)

	var req models.CreateExamSecurityRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.UpdateSecurity(uint(examId), req)

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "security updated"})
}
