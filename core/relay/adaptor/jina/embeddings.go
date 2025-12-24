package jina

import (
	"net/http"

	"github.com/bytedance/sonic/ast"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
	"github.com/wavespeed/llm-server/core/relay/meta"
)

func ConvertEmbeddingsRequest(
	meta *meta.Meta,
	req *http.Request,
) (adaptor.ConvertResult, error) {
	return openai.ConvertEmbeddingsRequest(meta, req, true, func(node *ast.Node) error {
		_, err := node.Unset("encoding_format")
		return err
	})
}
