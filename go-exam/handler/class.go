package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type ClassHandler struct {
	classService services.ClassService
}

func NewClassHandler(classService services.ClassService) *ClassHandler {
	return &ClassHandler{classService}
}

func (h *ClassHandler) GetClass(c *gin.Context) {
	data, err := h.classService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data class",
		"data":    data,
	})
}

func (h *ClassHandler) CreateClass(c *gin.Context) {
	var req models.CreateClassRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data tidak valid",
		})
		return
	}

	data, err := h.classService.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Class berhasil ditambahkan",
		"data":    data,
	})
}

func (h *ClassHandler) UpdateClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req models.UpdateClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data tidak valid",
		})
		return
	}

	if err := h.classService.Update(uint(id), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class berhasil diupdate",
	})
}

func (h *ClassHandler) DeleteClass(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.classService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Class berhasil dihapus",
	})
}
