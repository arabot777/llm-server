package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/utils"
)

func GetVideoGenerationJobRequestUsage(c *gin.Context, _ model.ModelConfig) (model.Usage, error) {
	_, err := utils.UnmarshalVideoGenerationJobRequest(c.Request)
	if err != nil {
		return model.Usage{}, err
	}

	return model.Usage{}, nil
}
