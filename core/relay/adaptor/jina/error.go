package jina

import (
	"net/http"

	"github.com/bytedance/sonic"
	"github.com/wavespeed/llm-server/core/common"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	relaymodel "github.com/wavespeed/llm-server/core/relay/model"
)

type Detail struct {
	Loc  []string `json:"loc"`
	Msg  string   `json:"msg"`
	Type string   `json:"type"`
}

func ErrorHanlder(resp *http.Response) adaptor.Error {
	defer resp.Body.Close()

	detailValue, err := common.UnmarshalResponse2Node(resp, "detail")
	if err != nil {
		return relaymodel.WrapperOpenAIError(err, "unmarshal_response_body_failed", resp.StatusCode)
	}

	errorMessage := "unknown error"
	errorType := relaymodel.ErrorTypeUpstream

	if detailStr, err := detailValue.String(); err == nil {
		errorMessage = detailStr
	} else {
		var details []Detail

		detailsData, _ := detailValue.Raw()
		if err := sonic.Unmarshal([]byte(detailsData), &details); err == nil && len(details) > 0 {
			errorMessage = details[0].Msg
			if details[0].Type != "" {
				errorType = details[0].Type
			}
		}
	}

	return relaymodel.NewOpenAIError(resp.StatusCode, relaymodel.OpenAIError{
		Message: errorMessage,
		Type:    errorType,
		Code:    resp.StatusCode,
	})
}
