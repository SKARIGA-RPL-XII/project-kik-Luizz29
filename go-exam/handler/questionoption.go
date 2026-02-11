package handler

import (

	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type QuestionOptionHandler struct {
	service services.QuestionOptionService
}

func NewQuestionOptionHandler(service services.QuestionOptionService) *QuestionOptionHandler {
	return &QuestionOptionHandler{service}
}
func (h *QuestionOptionHandler) GetByDetail(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("detailid"))

	data, err := h.service.GetByDetail(uint(id))
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": data})
}

func (h *QuestionOptionHandler) Create(c *gin.Context) {

	detailID, _ := strconv.Atoi(c.Param("detailid"))

	var req []models.CreateOptionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": "Invalid request"})
		return
	}

	err := h.service.Create(uint(detailID), req)
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(201, gin.H{"message": "Option created"})
}

func (h *QuestionOptionHandler) Delete(c *gin.Context) {

	detailID, _ := strconv.Atoi(c.Param("detailid"))

	err := h.service.DeleteByDetail(uint(detailID))
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Deleted"})
}
