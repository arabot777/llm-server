package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserType retrieves the user type from context
func GetUserType(c *gin.Context) string {
	userType, exists := c.Get("user_type")
	if !exists {
		return "regular"
	}
	return userType.(string)
}

// IsAdmin checks if the current user is an admin
func IsAdmin(c *gin.Context) bool {
	return GetUserType(c) == "admin"
}

// RequireAdmin is a middleware that requires admin privileges
// Returns 403 Forbidden if user is not admin
func RequireAdmin(c *gin.Context) {
	if !IsAdmin(c) {
		ErrorResponse(c, http.StatusForbidden, "admin access required")
		c.Abort()
		return
	}
	c.Next()
}

// FilterByUserGroup is a middleware that filters queries to user's group
// Admin users bypass this filter, regular users are restricted to their own group
func FilterByUserGroup(c *gin.Context) {
	if IsAdmin(c) {
		// Admins can access all groups
		c.Next()
		return
	}

	// Get user's token to find their group
	token := GetToken(c)

	// Set forced group for regular users
	c.Set("forced_group", token.Group)
	c.Next()
}
