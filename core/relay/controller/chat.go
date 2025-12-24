package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
	"github.com/wavespeed/llm-server/core/relay/utils"
)

func GetChatRequestUsage(c *gin.Context, _ model.ModelConfig) (model.Usage, error) {
	textRequest, err := utils.UnmarshalGeneralOpenAIRequest(c.Request)
	if err != nil {
		return model.Usage{}, err
	}

	return model.Usage{
		InputTokens: model.ZeroNullInt64(openai.CountTokenMessages(
			textRequest.Messages,
			textRequest.Model,
		)),
	}, nil
}
