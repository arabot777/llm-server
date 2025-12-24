package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/middleware"
	"github.com/wavespeed/llm-server/core/service"
	log "github.com/sirupsen/logrus"
)

// Login handles user login
// POST /api/auth/login
// Request: {"token": "your-api-key"}
// Response: {"success": true, "user_type": "admin|regular", "balance": 123.45}
func Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.ErrorResponse(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	ctx := c.Request.Context()
	resp, err := service.Login(ctx, req.Token)
	if err != nil {
		log.WithError(err).Error("Login failed")
		middleware.ErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	log.WithFields(log.Fields{
		"user_type": resp.UserType,
		"balance":   resp.Balance,
	}).Info("User login successful")

	middleware.SuccessResponse(c, resp)
}
