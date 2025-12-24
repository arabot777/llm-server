package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/meta"
)

type AwsAdapter interface {
	ConvertRequest(
		meta *meta.Meta,
		store adaptor.Store,
		req *http.Request,
	) (adaptor.ConvertResult, error)
	DoRequest(
		meta *meta.Meta,
		store adaptor.Store,
		c *gin.Context,
		req *http.Request,
	) (*http.Response, error)
	DoResponse(
		meta *meta.Meta,
		store adaptor.Store,
		c *gin.Context,
	) (usage model.Usage, err adaptor.Error)
}
