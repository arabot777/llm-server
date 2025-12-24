package sangforaicp

import (
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
)

type Adaptor struct {
	openai.Adaptor
}

func (a *Adaptor) DefaultBaseURL() string {
	return ""
}

func (a *Adaptor) Metadata() adaptor.Metadata {
	return adaptor.Metadata{}
}
