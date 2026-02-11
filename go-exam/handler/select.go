package handler

import (
	"net/http"

	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
)

type SelectHandler struct {
	service services.SelectService
}

func NewSelectHandler(service services.SelectService) *SelectHandler {
	return &SelectHandler{service}
}

func (h *SelectHandler) GetRoles(c *gin.Context) {
	roles, err := h.service.GetRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch roles",
		})
		return
	}

	c.JSON(http.StatusOK, roles)
}

func (h *SelectHandler) GetUsers(c *gin.Context) {
	users, err := h.service.GetUsers()
	if err != nil {
		println("ERROR GetUsers:", err.Error())

		c.JSON(500, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{"data": users})
}


func (h *SelectHandler) GetClasses(c *gin.Context) {
	classes, err := h.service.GetClasses()
	if err != nil {
		c.JSON(500, gin.H{"message": "Failed to fetch classes"})
		return
	}
	c.JSON(200, gin.H{"data": classes})
}

func (h *SelectHandler) GetSubjects(c *gin.Context) {
	subjects, err := h.service.GetSubjects()
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to fetch subjects",
		})
		return
	}

	c.JSON(200, gin.H{"data": subjects})
}


