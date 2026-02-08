package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type SubjectHandler struct {
	service services.SubjectService
}

func NewSubjectHandler(service services.SubjectService) *SubjectHandler {
	return &SubjectHandler{service}
}

func (h *SubjectHandler) CreateSubject(c *gin.Context) {
	var req models.CreateSubjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	subject, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
  "message": "Subject created",
  "data": subject,
})

}

func (h *SubjectHandler) GetSubjects(c *gin.Context) {
	subjects, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, subjects)
}

func (h *SubjectHandler) UpdateSubject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req models.UpdateSubjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(uint(id), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *SubjectHandler) DeleteSubject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	h.service.Delete(uint(id))
	c.JSON(http.StatusOK, gin.H{"success": true})
}
