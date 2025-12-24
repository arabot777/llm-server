package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/wavespeed/llm-server/core/common"
	"github.com/wavespeed/llm-server/core/common/config"
	"github.com/wavespeed/llm-server/core/model"
	"github.com/wavespeed/llm-server/core/relay/adaptor"
	"github.com/wavespeed/llm-server/core/relay/meta"
)

// HandleResult contains all the information needed for consumption recording
type HandleResult struct {
	Error  adaptor.Error
	Usage  model.Usage
	Detail *RequestDetail
}

func Handle(
	adaptor adaptor.Adaptor,
	c *gin.Context,
	meta *meta.Meta,
	store adaptor.Store,
) *HandleResult {
	log := common.GetLogger(c)

	usage, detail, respErr := DoHelper(adaptor, c, meta, store)
	if respErr != nil {
		var logDetail *RequestDetail
		if detail != nil && config.DebugEnabled {
			logDetail = detail
			log.Errorf(
				"handle failed: %+v\nrequest detail:\n%s\nresponse detail:\n%s",
				respErr,
				logDetail.RequestBody,
				logDetail.ResponseBody,
			)
		} else {
			log.Errorf("handle failed: %+v", respErr)
		}

		return &HandleResult{
			Error:  respErr,
			Usage:  usage,
			Detail: detail,
		}
	}

	return &HandleResult{
		Usage:  usage,
		Detail: detail,
	}
}
