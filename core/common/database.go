package common

import (
	"github.com/wavespeed/llm-server/core/common/env"
)

var UsingSQLite = false
var UsingMySQL = false
var UsingPostgreSQL = false

var (
	SQLitePath        = env.String("SQLITE_PATH", "aiproxy.db")
	SQLiteBusyTimeout = env.Int64("SQLITE_BUSY_TIMEOUT", 3000)
)
