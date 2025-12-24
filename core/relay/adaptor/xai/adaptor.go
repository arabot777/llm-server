package xai

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
	"github.com/wavespeed/llm-server/core/relay/meta"
)

type Adaptor struct {
	openai.Adaptor
}

const baseURL = "https://api.x.ai/v1"

func (a *Adaptor) DefaultBaseURL() string {
	return baseURL
}

func (a *Adaptor) DoResponse(
	meta *meta.Meta,
	store adaptor.Store,
	c *gin.Context,
	resp *http.Response,
) (usage model.Usage, err adaptor.Error) {
	if resp.StatusCode != http.StatusOK {
		return model.Usage{}, ErrorHandler(resp)
	}

	return a.Adaptor.DoResponse(meta, store, c, resp)
}

func (a *Adaptor) Metadata() adaptor.Metadata {
	return adaptor.Metadata{
		Models: ModelList,
	}
}
