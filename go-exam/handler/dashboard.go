package handler

import (
	"net/http"

	"github.com/Luizz29/go-gin-project/services"
	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service services.DashboardService
}

func NewDashboardHandler(service services.DashboardService) *DashboardHandler {
	return &DashboardHandler{service}
}

func (h *DashboardHandler) GetAdminStats(c *gin.Context) {
	stats, err := h.service.GetAdminStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *DashboardHandler) GetTeacherStats(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	stats, err := h.service.GetTeacherStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
