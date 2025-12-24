package wavespeed

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
)

const (
	defaultBaseURL = "https://api-test.wavespeed.ai"
	defaultTimeout = 10 * time.Second
)

// BalanceResponse represents the response from WaveSpeed balance API
type BalanceResponse struct {
	Code    int     `json:"code"`
	Message string  `json:"message"`
	Data    struct {
		Balance float64 `json:"balance"`
	} `json:"data"`
}

// Client is the WaveSpeed API client
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new WaveSpeed API client
func NewClient() *Client {
	return &Client{
		BaseURL: defaultBaseURL,
		HTTPClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

// NewClientWithURL creates a new WaveSpeed API client with custom base URL
func NewClientWithURL(baseURL string) *Client {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

// ValidateAPIKey validates the API key and returns balance if valid
func (c *Client) ValidateAPIKey(ctx context.Context, apiKey string) (*BalanceResponse, error) {
	if apiKey == "" {
		return nil, errors.New("API key is required")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/api/v3/balance", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var balanceResp BalanceResponse
	if err := json.NewDecoder(resp.Body).Decode(&balanceResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Check for API errors
	if balanceResp.Code == 401 {
		return nil, errors.New("unauthorized: invalid API key")
	}

	if balanceResp.Code != 200 {
		return nil, fmt.Errorf("API error (code %d): %s", balanceResp.Code, balanceResp.Message)
	}

	log.WithFields(log.Fields{
		"api_key": maskAPIKey(apiKey),
		"balance": balanceResp.Data.Balance,
	}).Debug("WaveSpeed API key validated successfully")

	return &balanceResp, nil
}

// GetBalance retrieves the balance for a given API key
func (c *Client) GetBalance(ctx context.Context, apiKey string) (float64, error) {
	resp, err := c.ValidateAPIKey(ctx, apiKey)
	if err != nil {
		return 0, err
	}
	return resp.Data.Balance, nil
}

// maskAPIKey masks the API key for logging (shows first 8 and last 8 characters)
func maskAPIKey(apiKey string) string {
	if len(apiKey) <= 16 {
		return "*****"
	}
	return apiKey[:8] + "..." + apiKey[len(apiKey)-8:]
}
