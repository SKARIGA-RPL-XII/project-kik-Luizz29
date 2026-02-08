package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type TeacherHandler struct {
	service services.TeacherService
}

func NewTeacherHandler(s services.TeacherService) *TeacherHandler {
	return &TeacherHandler{s}
}

func (h *TeacherHandler) GetTeacher(c *gin.Context) {
	data, err := h.service.GetAll()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": data,
	})
}

func (h *TeacherHandler) CreateTeacher(c *gin.Context) {

	var req models.CreateTeacherRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	data, err := h.service.Create(req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": data,
	})
}

func (h *TeacherHandler) UpdateTeacher(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	var req models.UpdateTeacherRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	err := h.service.Update(uint(id), req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Teacher updated",
	})
}

func (h *TeacherHandler) DeleteTeacher(c *gin.Context) {

	id, _ := strconv.Atoi(c.Param("id"))

	err := h.service.Delete(uint(id))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Teacher deleted",
	})
}
