package gitee

import (
	"github.com/wavespeed/llm-server/core/model"
	mcpservers "github.com/wavespeed/llm-server/mcp-servers"
)

const defaultURL = "https://api.gitee.com/mcp"

var configTemplates = mcpservers.ProxyConfigTemplates{
	"Authorization": {
		ConfigTemplate: mcpservers.ConfigTemplate{
			Name:        "PAT",
			Required:    mcpservers.ConfigRequiredTypeInitOrReusingOnly,
			Description: "The Personal Access Token of the Gitee",
		},
		Type: model.ParamTypeHeader,
	},

	"url": {
		ConfigTemplate: mcpservers.ConfigTemplate{
			Name:        "URL",
			Required:    mcpservers.ConfigRequiredTypeInitOptional,
			Example:     defaultURL,
			Default:     defaultURL,
			Description: "The Streamable http URL of the Gitee MCP server",
		},
		Type: model.ParamTypeURL,
	},
}
