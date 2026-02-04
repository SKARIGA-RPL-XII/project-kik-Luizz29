package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Luizz29/go-gin-project/models"
	"github.com/Luizz29/go-gin-project/services"
)

type SiswaHandler struct {
	siswaService services.SiswaService
}

func NewSiswaHandler(service services.SiswaService) *SiswaHandler {
	return &SiswaHandler{service}
}

func (h *SiswaHandler) GetSiswa(c *gin.Context) {
	data, err := h.siswaService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data siswa",
		"data":    data,
	})
}

func (h *SiswaHandler) CreateSiswa(c *gin.Context) {
	var req models.CreateSiswaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data tidak valid",
		})
		return
	}

	data, err := h.siswaService.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Siswa berhasil ditambahkan",
		"data":    data,
	})
}

func (h *SiswaHandler) UpdateSiswa(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req models.UpdateSiswaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data tidak valid",
		})
		return
	}

	if err := h.siswaService.Update(uint(id), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Siswa berhasil diupdate",
	})
}

func (h *SiswaHandler) DeleteSiswa(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.siswaService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Siswa berhasil dihapus",
	})
}
