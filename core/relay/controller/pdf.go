package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
)

func GetPdfRequestUsage(_ *gin.Context, _ model.ModelConfig) (model.Usage, error) {
	return model.Usage{}, nil
}
