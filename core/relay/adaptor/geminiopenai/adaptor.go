package geminiopenai

import (
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/gemini"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
)

type Adaptor struct {
	openai.Adaptor
}

const baseURL = "https://generativelanguage.googleapis.com/v1beta/openai"

func (a *Adaptor) DefaultBaseURL() string {
	return baseURL
}

func (a *Adaptor) Metadata() adaptor.Metadata {
	return adaptor.Metadata{
		Readme: "https://ai.google.dev/gemini-api/docs/openai\nOpenAI compatibility",
		Models: gemini.ModelList,
	}
}
