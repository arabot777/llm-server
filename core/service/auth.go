package service

import (
	"context"
	"errors"
	"time"

	"github.com/wavespeed/llm-server/core/common/config"
	"github.com/wavespeed/llm-server/core/common/wavespeed"
	"github.com/wavespeed/llm-server/core/model"
	log "github.com/sirupsen/logrus"
)

const (
	UserTypeAdmin   = "admin"
	UserTypeRegular = "regular"
)

// LoginRequest represents the login request
type LoginRequest struct {
	Token string `json:"token" binding:"required,min=6"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Success  bool    `json:"success"`
	UserType string  `json:"user_type"` // "admin" or "regular"
	Token    string  `json:"token"`
	Balance  float64 `json:"balance,omitempty"`
	Message  string  `json:"message,omitempty"`
}

// Login handles the login logic
// 1. Check if token is ADMIN_KEY -> return admin
// 2. Validate against WaveSpeed API -> if invalid, return error
// 3. Check if token exists in local DB -> if not, create it
// 4. Sync balance from WaveSpeed
// 5. Return success with user type and balance
func Login(ctx context.Context, token string) (*LoginResponse, error) {
	if token == "" {
		return nil, errors.New("token is required")
	}

	// Step 1: Check if this is an admin login
	if config.AdminKey != "" && token == config.AdminKey {
		log.WithField("user_type", UserTypeAdmin).Info("Admin login successful")
		return &LoginResponse{
			Success:  true,
			UserType: UserTypeAdmin,
			Token:    token,
		}, nil
	}

	// Step 2: Validate against WaveSpeed API
	client := wavespeed.NewClient()
	balanceResp, err := client.ValidateAPIKey(ctx, token)
	if err != nil {
		log.WithError(err).Error("WaveSpeed API validation failed")
		return nil, errors.New("invalid token: " + err.Error())
	}

	balance := balanceResp.Data.Balance

	// Step 3: Check if token exists in local DB
	tokens, _, err := model.SearchTokens(
		"",    // group
		"",    // keyword
		0,     // page
		1,     // perPage
		"",    // order
		0,     // status
		"",    // name
		token, // key - search by token key
	)
	if err != nil {
		log.WithError(err).Error("Failed to search tokens")
		return nil, errors.New("failed to check token in database")
	}

	var tokenID int
	var groupID string

	if len(tokens) == 0 {
		// Step 4: Token doesn't exist, create new token and group
		log.WithField("api_key", maskToken(token)).Info("Creating new WaveSpeed user")

		// Use API key as both token key and group ID
		groupID = token

		// Create group first
		newGroup := &model.Group{
			ID:     groupID,
			Status: model.GroupStatusEnabled,
		}
		if err := model.OnConflictDoNothing().Create(newGroup).Error; err != nil {
			log.WithError(err).Error("Failed to create group")
			return nil, errors.New("failed to create user group")
		}

		// Create token
		newToken := &model.Token{
			Name:            model.EmptyNullString(token),
			Key:             token,
			GroupID:         groupID,
			Status:          model.TokenStatusEnabled,
			Quota:           balance,
			UserType:        UserTypeRegular,
			IsWaveSpeedUser: true,
			BalanceLastSync: time.Now(),
		}

		if err := model.InsertToken(newToken, true, true); err != nil {
			log.WithError(err).Error("Failed to create token")
			return nil, errors.New("failed to create user token")
		}

		tokenID = newToken.ID
		groupID = newToken.GroupID

		// Add token to cache so subsequent API calls can use it
		tokenCache := newToken.ToTokenCache()
		if err := model.CacheSetToken(tokenCache); err != nil {
			log.WithError(err).Warn("Failed to cache token, but user was created successfully")
		}

		log.WithFields(log.Fields{
			"token_id": tokenID,
			"group_id": groupID,
			"balance":  balance,
		}).Info("WaveSpeed user created successfully")
	} else {
		// Token exists, update balance
		existingToken := tokens[0]
		tokenID = existingToken.ID
		groupID = existingToken.GroupID

		log.WithFields(log.Fields{
			"token_id": tokenID,
			"group_id": groupID,
		}).Info("Existing WaveSpeed user login")

		// Step 5: Update balance
		if err := UpdateTokenBalance(tokenID, balance); err != nil {
			log.WithError(err).Warn("Failed to update token balance, continuing with login")
			// Don't fail the login if balance update fails
		}

		// Refresh token cache to ensure latest data
		if err := model.CacheDeleteToken(existingToken.Key); err != nil {
			log.WithError(err).Warn("Failed to delete token cache")
		}
	}

	return &LoginResponse{
		Success:  true,
		UserType: UserTypeRegular,
		Token:    token,
		Balance:  balance,
	}, nil
}

// UpdateTokenBalance updates the token balance and last sync time
func UpdateTokenBalance(tokenID int, balance float64) error {
	return model.DB.Model(&model.Token{}).
		Where("id = ?", tokenID).
		Updates(map[string]interface{}{
			"quota":              balance,
			"balance_last_sync":  time.Now(),
		}).Error
}

// maskToken masks the token for logging
func maskToken(token string) string {
	if len(token) <= 16 {
		return "*****"
	}
	return token[:8] + "..." + token[len(token)-8:]
}
