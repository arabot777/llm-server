package adaptors

import (
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/ai360"
	"github.com/wavespeed/llm-server/core/relay/adaptor/ali"
	"github.com/wavespeed/llm-server/core/relay/adaptor/anthropic"
	"github.com/wavespeed/llm-server/core/relay/adaptor/aws"
	"github.com/wavespeed/llm-server/core/relay/adaptor/azure"
	"github.com/wavespeed/llm-server/core/relay/adaptor/azure2"
	"github.com/wavespeed/llm-server/core/relay/adaptor/baichuan"
	"github.com/wavespeed/llm-server/core/relay/adaptor/baidu"
	"github.com/wavespeed/llm-server/core/relay/adaptor/baiduv2"
	"github.com/wavespeed/llm-server/core/relay/adaptor/cloudflare"
	"github.com/wavespeed/llm-server/core/relay/adaptor/cohere"
	"github.com/wavespeed/llm-server/core/relay/adaptor/coze"
	"github.com/wavespeed/llm-server/core/relay/adaptor/deepseek"
	"github.com/wavespeed/llm-server/core/relay/adaptor/doc2x"
	"github.com/wavespeed/llm-server/core/relay/adaptor/doubao"
	"github.com/wavespeed/llm-server/core/relay/adaptor/doubaoaudio"
	"github.com/wavespeed/llm-server/core/relay/adaptor/gemini"
	"github.com/wavespeed/llm-server/core/relay/adaptor/geminiopenai"
	"github.com/wavespeed/llm-server/core/relay/adaptor/groq"
	"github.com/wavespeed/llm-server/core/relay/adaptor/jina"
	"github.com/wavespeed/llm-server/core/relay/adaptor/lingyiwanwu"
	"github.com/wavespeed/llm-server/core/relay/adaptor/minimax"
	"github.com/wavespeed/llm-server/core/relay/adaptor/mistral"
	"github.com/wavespeed/llm-server/core/relay/adaptor/moonshot"
	"github.com/wavespeed/llm-server/core/relay/adaptor/novita"
	"github.com/wavespeed/llm-server/core/relay/adaptor/ollama"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openai"
	"github.com/wavespeed/llm-server/core/relay/adaptor/openrouter"
	"github.com/wavespeed/llm-server/core/relay/adaptor/qianfan"
	"github.com/wavespeed/llm-server/core/relay/adaptor/sangforaicp"
	"github.com/wavespeed/llm-server/core/relay/adaptor/siliconflow"
	"github.com/wavespeed/llm-server/core/relay/adaptor/stepfun"
	"github.com/wavespeed/llm-server/core/relay/adaptor/streamlake"
	"github.com/wavespeed/llm-server/core/relay/adaptor/tencent"
	textembeddingsinference "github.com/wavespeed/llm-server/core/relay/adaptor/text-embeddings-inference"
	"github.com/wavespeed/llm-server/core/relay/adaptor/vertexai"
	"github.com/wavespeed/llm-server/core/relay/adaptor/xai"
	"github.com/wavespeed/llm-server/core/relay/adaptor/xunfei"
	"github.com/wavespeed/llm-server/core/relay/adaptor/zhipu"
	"github.com/wavespeed/llm-server/core/relay/adaptor/zhipucoding"
	log "github.com/sirupsen/logrus"
)

var ChannelAdaptor = map[model.ChannelType]adaptor.Adaptor{
	model.ChannelTypeOpenAI:                  &openai.Adaptor{},
	model.ChannelTypeAzure:                   &azure.Adaptor{},
	model.ChannelTypeAzure2:                  &azure2.Adaptor{},
	model.ChannelTypeGoogleGeminiOpenAI:      &geminiopenai.Adaptor{},
	model.ChannelTypeBaiduV2:                 &baiduv2.Adaptor{},
	model.ChannelTypeAnthropic:               &anthropic.Adaptor{},
	model.ChannelTypeBaidu:                   &baidu.Adaptor{},
	model.ChannelTypeZhipu:                   &zhipu.Adaptor{},
	model.ChannelTypeAli:                     &ali.Adaptor{},
	model.ChannelTypeXunfei:                  &xunfei.Adaptor{},
	model.ChannelTypeAI360:                   &ai360.Adaptor{},
	model.ChannelTypeOpenRouter:              &openrouter.Adaptor{},
	model.ChannelTypeTencent:                 &tencent.Adaptor{},
	model.ChannelTypeGoogleGemini:            &gemini.Adaptor{},
	model.ChannelTypeMoonshot:                &moonshot.Adaptor{},
	model.ChannelTypeBaichuan:                &baichuan.Adaptor{},
	model.ChannelTypeMinimax:                 &minimax.Adaptor{},
	model.ChannelTypeMistral:                 &mistral.Adaptor{},
	model.ChannelTypeGroq:                    &groq.Adaptor{},
	model.ChannelTypeOllama:                  &ollama.Adaptor{},
	model.ChannelTypeLingyiwanwu:             &lingyiwanwu.Adaptor{},
	model.ChannelTypeStepfun:                 &stepfun.Adaptor{},
	model.ChannelTypeAWS:                     &aws.Adaptor{},
	model.ChannelTypeCoze:                    &coze.Adaptor{},
	model.ChannelTypeCohere:                  &cohere.Adaptor{},
	model.ChannelTypeDeepseek:                &deepseek.Adaptor{},
	model.ChannelTypeCloudflare:              &cloudflare.Adaptor{},
	model.ChannelTypeDoubao:                  &doubao.Adaptor{},
	model.ChannelTypeNovita:                  &novita.Adaptor{},
	model.ChannelTypeVertexAI:                &vertexai.Adaptor{},
	model.ChannelTypeSiliconflow:             &siliconflow.Adaptor{},
	model.ChannelTypeDoubaoAudio:             &doubaoaudio.Adaptor{},
	model.ChannelTypeXAI:                     &xai.Adaptor{},
	model.ChannelTypeDoc2x:                   &doc2x.Adaptor{},
	model.ChannelTypeJina:                    &jina.Adaptor{},
	model.ChannelTypeTextEmbeddingsInference: &textembeddingsinference.Adaptor{},
	model.ChannelTypeQianfan:                 &qianfan.Adaptor{},
	model.ChannelTypeSangforAICP:             &sangforaicp.Adaptor{},
	model.ChannelTypeStreamlake:              &streamlake.Adaptor{},
	model.ChannelTypeZhipuCoding:             &zhipucoding.Adaptor{},
}

func GetAdaptor(channelType model.ChannelType) (adaptor.Adaptor, bool) {
	a, ok := ChannelAdaptor[channelType]
	return a, ok
}

type AdaptorMeta struct {
	Name            string                            `json:"name"`
	KeyHelp         string                            `json:"keyHelp"`
	DefaultBaseURL  string                            `json:"defaultBaseUrl"`
	Readme          string                            `json:"readme"`
	ConfigTemplates map[string]adaptor.ConfigTemplate `json:"configs,omitempty"`
}

var ChannelMetas = map[model.ChannelType]AdaptorMeta{}

func init() {
	for i, a := range ChannelAdaptor {
		adaptorMeta := a.Metadata()

		meta := AdaptorMeta{
			Name:            i.String(),
			KeyHelp:         adaptorMeta.KeyHelp,
			DefaultBaseURL:  a.DefaultBaseURL(),
			Readme:          adaptorMeta.Readme,
			ConfigTemplates: adaptorMeta.ConfigTemplates.Configs,
		}
		for key, template := range adaptorMeta.ConfigTemplates.Configs {
			if template.Name == "" {
				log.Fatalf("config template %s is invalid: name is empty", key)
			}
		}

		ChannelMetas[i] = meta
	}
}

var defaultKeyValidator adaptor.KeyValidator = (*KeyValidatorNoop)(nil)

type KeyValidatorNoop struct{}

func (a *KeyValidatorNoop) ValidateKey(_ string) error {
	return nil
}

func GetKeyValidator(a adaptor.Adaptor) adaptor.KeyValidator {
	if keyValidator, ok := a.(adaptor.KeyValidator); ok {
		return keyValidator
	}
	return defaultKeyValidator
}
