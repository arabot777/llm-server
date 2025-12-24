package kuaidi100

import (
	"github.com/wavespeed/llm-server/core/model"
	mcpservers "github.com/wavespeed/llm-server/mcp-servers"
)

const defaultURL = "http://api.kuaidi100.com/mcp/sse"

var configTemplates = mcpservers.ProxyConfigTemplates{
	"key": {
		ConfigTemplate: mcpservers.ConfigTemplate{
			Name:        "KEY",
			Required:    mcpservers.ConfigRequiredTypeInitOrReusingOnly,
			Example:     "1234567890",
			Description: "The Key of the Kuaidi100 MCP server",
		},
		Type: model.ParamTypeQuery,
	},

	"url": {
		ConfigTemplate: mcpservers.ConfigTemplate{
			Name:        "URL",
			Required:    mcpservers.ConfigRequiredTypeInitOptional,
			Example:     defaultURL,
			Default:     defaultURL,
			Description: "The SSE URL of the Kuaidi100 MCP server",
		},
		Type: model.ParamTypeURL,
	},
}
