package openai

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/wavespeed/llm-server/core/common"
	"github.com/wavespeed/llm-server/core/common/conv"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	relaymodel "github.com/wavespeed/llm-server/core/relay/model"
)

func GetError(resp *http.Response) (int, relaymodel.OpenAIError) {
	defer resp.Body.Close()

	respBody, err := common.GetResponseBody(resp)
	if err != nil {
		return resp.StatusCode, relaymodel.OpenAIError{
			Message: err.Error(),
			Type:    relaymodel.ErrorTypeUpstream,
			Code:    relaymodel.ErrorCodeBadResponse,
		}
	}

	return GetErrorWithBody(resp.StatusCode, respBody)
}

func GetErrorWithBody(statusCode int, respBody []byte) (int, relaymodel.OpenAIError) {
	openAIError := relaymodel.OpenAIError{
		Type:  relaymodel.ErrorTypeUpstream,
		Code:  relaymodel.ErrorCodeBadResponse,
		Param: strconv.Itoa(statusCode),
	}

	var errResponse relaymodel.OpenAIErrorResponse

	err := sonic.Unmarshal(respBody, &errResponse)
	if err != nil {
		openAIError.Message = conv.BytesToString(respBody)
		return statusCode, openAIError
	}

	if errResponse.Error.Message != "" {
		// OpenAI format error, so we override the default one
		openAIError = errResponse.Error
	}

	// OpenRouter wraps upstream errors in metadata.raw, extract the real error message
	var rawResponse map[string]any
	if err := sonic.Unmarshal(respBody, &rawResponse); err == nil {
		if errorMap, ok := rawResponse["error"].(map[string]any); ok {
			if metadata, ok := errorMap["metadata"].(map[string]any); ok {
				if rawStr, ok := metadata["raw"].(string); ok {
					var realError relaymodel.OpenAIErrorResponse
					if err := sonic.UnmarshalString(rawStr, &realError); err == nil {
						if realError.Error.Message != "" {
							// Only extract message and type, preserve the HTTP status code
							openAIError.Message = realError.Error.Message
							if realError.Error.Type != "" {
								openAIError.Type = realError.Error.Type
							}
						}
					}
				}
			}
		}
	}

	if openAIError.Message == "" {
		openAIError.Message = fmt.Sprintf("bad response status code %d", statusCode)
	}

	if code, ok := openAIError.Code.(int64); ok && code >= 400 && code < 600 {
		statusCode = int(code)
	}

	if strings.HasPrefix(openAIError.Message, "tools is not supported in this model.") {
		statusCode = http.StatusBadRequest
	}

	return statusCode, openAIError
}

func ErrorHanlder(resp *http.Response) adaptor.Error {
	statusCode, openAIError := GetError(resp)
	return relaymodel.NewOpenAIError(statusCode, openAIError)
}

func ErrorHanlderWithBody(statusCode int, respBody []byte) adaptor.Error {
	statusCode, openAIError := GetErrorWithBody(statusCode, respBody)
	return relaymodel.NewOpenAIError(statusCode, openAIError)
}

func VideoErrorHanlder(resp *http.Response) adaptor.Error {
	defer resp.Body.Close()

	respBody, err := common.GetResponseBody(resp)
	if err != nil {
		return relaymodel.NewOpenAIVideoError(resp.StatusCode, relaymodel.OpenAIVideoError{
			Detail: err.Error(),
		})
	}

	return VideoErrorHanlderWithBody(resp.StatusCode, respBody)
}

func VideoErrorHanlderWithBody(statusCode int, respBody []byte) adaptor.Error {
	statusCode, openAIError := GetVideoErrorWithBody(statusCode, respBody)
	return relaymodel.NewOpenAIVideoError(statusCode, openAIError)
}

func GetVideoErrorWithBody(statusCode int, respBody []byte) (int, relaymodel.OpenAIVideoError) {
	openAIError := relaymodel.OpenAIVideoError{}

	err := sonic.Unmarshal(respBody, &openAIError)
	if err != nil {
		openAIError.Detail = string(respBody)
		return statusCode, openAIError
	}

	return statusCode, openAIError
}
