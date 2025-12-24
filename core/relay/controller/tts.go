package controller

import (
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/utils"
)

func GetTTSRequestUsage(c *gin.Context, _ model.ModelConfig) (model.Usage, error) {
	ttsRequest, err := utils.UnmarshalTTSRequest(c.Request)
	if err != nil {
		return model.Usage{}, err
	}

	return model.Usage{
		InputTokens: model.ZeroNullInt64(utf8.RuneCountInString(ttsRequest.Input)),
	}, nil
}
