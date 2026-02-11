package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type QuestionBankHandler struct {
	service services.QuestionBankService
}

func NewQuestionBankHandler(service services.QuestionBankService) *QuestionBankHandler {
	return &QuestionBankHandler{service}
}

func (h *QuestionBankHandler) GetAll(c *gin.Context) {

	data, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success",
		"data":    data,
	})
}

func (h *QuestionBankHandler) Create(c *gin.Context) {

	var req models.CreateQuestionBankRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	data, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Question Bank Created",
		"data":    data,
	})
}

func (h *QuestionBankHandler) Delete(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	err := h.service.Delete(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Deleted Successfully",
	})
}
