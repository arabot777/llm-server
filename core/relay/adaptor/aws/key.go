package aws

import (
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/adaptor/aws/utils"
)

var _ adaptor.KeyValidator = (*Adaptor)(nil)

func (a *Adaptor) ValidateKey(key string) error {
	_, err := utils.GetAwsConfigFromKey(key)
	if err != nil {
		return err
	}

	return nil
}
