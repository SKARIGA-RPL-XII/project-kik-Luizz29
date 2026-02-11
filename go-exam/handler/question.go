package handler

import (
	"net/http"
	"strconv"

	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
)

type QuestionHandler struct {
	service services.QuestionService
}

func NewQuestionHandler(service services.QuestionService) *QuestionHandler {
	return &QuestionHandler{service}
}
func (h *QuestionHandler) GetByHeader(c *gin.Context) {

	headerID, _ := strconv.Atoi(c.Param("headerid"))

	data, err := h.service.GetByHeader(uint(headerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}
func (h *QuestionHandler) Create(c *gin.Context) {

	headerID, _ := strconv.Atoi(c.Param("headerid"))

	var req models.CreateQuestionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	data, err := h.service.Create(uint(headerID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": data})
}
func (h *QuestionHandler) Update(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("detailid"))

	var req models.UpdateQuestionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	err := h.service.Update(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated"})
}
func (h *QuestionHandler) Delete(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("detailid"))

	err := h.service.Delete(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
