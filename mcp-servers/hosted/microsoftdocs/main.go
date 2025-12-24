package microsoftdocs

import (
	"github.com/wavespeed/llm-server/core/model"
	mcpservers "github.com/wavespeed/llm-server/mcp-servers"
)

const defaultURL = "https://learn.microsoft.com/api/mcp"

var configTemplates = mcpservers.ProxyConfigTemplates{
	"url": {
		ConfigTemplate: mcpservers.ConfigTemplate{
			Name:        "URL",
			Required:    mcpservers.ConfigRequiredTypeInitOptional,
			Example:     defaultURL,
			Default:     defaultURL,
			Description: "The Streamable http URL of the Microsoft Learn Docs MCP server",
		},
		Type: model.ParamTypeURL,
	},
}
