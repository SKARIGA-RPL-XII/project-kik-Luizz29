package handler

import (
	"strconv"
	"net/http"

	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := int(userIDValue.(uint))

	result, err := h.service.GetDashboard(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *StudentHandler) JoinExam(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "exam id tidak valid"})
		return
	}

	var req struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}
    
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid payload"})
		return
	}

	clientIP := c.ClientIP()

	err = h.service.JoinExam(userID, examID, req.Latitude, req.Longitude, clientIP)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "allowed"})
}

func (h *StudentHandler) GetExamQuestions(c *gin.Context) {
    
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "exam id tidak valid"})
		return
	}

	result, err := h.service.GetExamQuestions(userID, examID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *StudentHandler) Heartbeat(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "exam id tidak valid"})
		return
	}

	var req struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid payload"})
		return
	}

	clientIP := c.ClientIP()

	err = h.service.ValidateSecurity(userID, examID, req.Latitude, req.Longitude, clientIP)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "secure"})
}

func (h *StudentHandler) SubmitExam(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "exam id tidak valid"})
		return
	}

	var req struct {
		Answers   map[uint]uint `json:"answers"`
		Latitude  float64       `json:"latitude"`
		Longitude float64       `json:"longitude"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid payload"})
		return
	}

	clientIP := c.ClientIP()

	err = h.service.SubmitExam(userID, examID, req.Answers, req.Latitude, req.Longitude, clientIP)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "submitted"})
}

func (h *StudentHandler) GetExamResult(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := int(userIDVal.(uint))

	examID, err := strconv.Atoi(c.Param("examID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "exam id tidak valid"})
		return
	}

	result, err := h.service.GetExamResult(userID, examID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}