package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type ExamHandler struct {
	service services.ExamService
}

func NewExamHandler(service services.ExamService) *ExamHandler {
	return &ExamHandler{service}
}

func (h *ExamHandler) Create(c *gin.Context) {

	var req models.ExamRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	exam, err := h.service.Create(req, 1)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, exam)
}

func (h *ExamHandler) GetAll(c *gin.Context) {

	data, err := h.service.GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, data)
}

func (h *ExamHandler) GetByID(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	data, err := h.service.GetByID(uint(id))

	if err != nil {
		c.JSON(http.StatusNotFound, err)
		return
	}

	c.JSON(http.StatusOK, data)
}

func (h *ExamHandler) Update(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	var req models.ExamRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	err := h.service.Update(uint(id), req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func (h *ExamHandler) Delete(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	err := h.service.Delete(uint(id))

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
func (h *ExamHandler) SetBank(c *gin.Context) {

	idParam := c.Param("id")
	examID, _ := strconv.Atoi(idParam)

	var req struct {
		QuestionBankID uint `json:"questionbankid"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.service.SetBank(uint(examID), req.QuestionBankID)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Bank applied"})
}

func (h *ExamHandler) GetExamQuestions(c *gin.Context) {

	idParam := c.Param("id")
	examID, _ := strconv.Atoi(idParam)

	data, err := h.service.GetExamQuestions(uint(examID))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": data})
}

func (h *ExamHandler) AssignClass(c *gin.Context) {

	examID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid exam ID"})
		return
	}

	var req models.AssignClassRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"message": err.Error()})
		return
	}

	err = h.service.AssignClass(uint(examID), req)
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"message": "Class assigned successfully",
	})
}

func (h *ExamHandler) GetAssignedClasses(c *gin.Context) {

	examID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid exam ID"})
		return
	}

	data, err := h.service.GetAssignedClasses(uint(examID))
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": data})
}
func (h *ExamHandler) GetParticipants(c *gin.Context) {

	examID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"message": "Invalid exam ID"})
		return
	}

	data, err := h.service.GetParticipants(uint(examID))
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": data})
}
func (h *ExamHandler) Publish(c *gin.Context) {

	idParam := c.Param("id")

	examID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid exam id",
		})
		return
	}

	err = h.service.PublishExam(uint(examID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "exam published",
	})
}
