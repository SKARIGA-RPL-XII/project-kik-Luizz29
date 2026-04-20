package handler

import (
	"net/http"
	"strconv"

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
	roleName := c.Query("role")

	users, err := h.service.GetUsers(roleName)
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

func (h *SelectHandler) GetTeachers(c *gin.Context) {
    subjectIDStr := c.Query("subject_id")
    var subjectID uint
    if subjectIDStr != "" {
        id, err := strconv.ParseUint(subjectIDStr, 10, 32)
        if err == nil {
            subjectID = uint(id)
        }
    }

    teachers, err := h.service.GetTeachers(subjectID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Failed to fetch teachers",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": teachers})
}

