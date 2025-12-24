package vertexai

import (
	relaymodel "github.com/wavespeed/llm-server/core/relay/model"
)

type Request struct {
	AnthropicVersion string `json:"anthropic_version"`
	*relaymodel.ClaudeRequest
}
