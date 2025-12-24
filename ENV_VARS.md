# 环境变量完整列表

本文档列出了 AI Proxy 支持的所有环境变量及其说明。

## 📝 快速参考

- **配置文件位置**: `core/.env`
- **示例文件**: `core/.env.example`
- **优先级**: 环境变量 > .env 文件 > 配置文件 > 数据库

---

## 🔧 核心配置

### ADMIN_KEY
- **类型**: String
- **必需**: ✅ 是
- **默认值**: 无（首次启动自动生成）
- **说明**: 管理员 API Key，用于管理后台和 API 认证
- **示例**: `ADMIN_KEY=aiproxy-local-dev`

### LISTEN
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `0.0.0.0:3000`
- **说明**: HTTP 服务监听地址
- **示例**: `LISTEN=0.0.0.0:8080`
- **命令行**: 可通过 `-listen` 参数覆盖

---

## 💾 数据库配置

### SQL_DSN
- **类型**: String
- **必需**: ❌ 否（默认使用 SQLite）
- **默认值**: `aiproxy.db`（SQLite）
- **说明**: 主数据库连接字符串
- **支持**: PostgreSQL, MySQL, SQLite
- **示例**:
  - PostgreSQL: `postgres://user:pass@host:5432/dbname?sslmode=disable`
  - MySQL: `root:password@tcp(host:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local` 或 `mysql://root:password@tcp(host:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local`
  - SQLite: `aiproxy.db`

### LOG_SQL_DSN
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 使用主数据库
- **说明**: 日志数据库连接（可选，用于分离日志数据），格式同 SQL_DSN
- **示例**: `postgres://user:pass@host:5432/log_db?sslmode=disable`

### DISABLE_AUTO_MIGRATE_DB
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 禁用自动数据库迁移
- **示例**: `DISABLE_AUTO_MIGRATE_DB=true`

### SQLITE_PATH
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `aiproxy.db`
- **说明**: SQLite 数据库文件路径
- **示例**: `SQLITE_PATH=/data/aiproxy.db`

### SQLITE_BUSY_TIMEOUT
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `3000`（毫秒）
- **说明**: SQLite 忙等待超时时间
- **示例**: `SQLITE_BUSY_TIMEOUT=5000`

---

## 🗄️ 缓存配置

### REDIS
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无（禁用 Redis）
- **说明**: Redis 连接字符串
- **格式**: `redis://host:port/db?password=xxx`
- **示例**:
  - `REDIS=redis://localhost:6379`
  - `REDIS=redis://localhost:6379/0?password=mypass`
- **别名**: `REDIS_CONN_STRING`

### REDIS_KEY_PREFIX
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `aiproxy`
- **说明**: Redis Key 前缀
- **示例**: `REDIS_KEY_PREFIX=my-aiproxy`

---

## 🐛 开发调试配置

### DEBUG
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 启用调试模式（详细日志）
- **示例**: `DEBUG=true`

### DEBUG_SQL
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 启用 SQL 调试（打印所有 SQL 语句）
- **示例**: `DEBUG_SQL=true`

### TZ
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 系统时区
- **说明**: 时区设置
- **示例**: `TZ=Asia/Shanghai`

---

## 📊 日志配置

### LOG_STORAGE_HOURS
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `168`（7天）
- **说明**: 主日志保留时间（小时），0 表示不限制
- **示例**: `LOG_STORAGE_HOURS=720`

### RETRY_LOG_STORAGE_HOURS
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `72`（3天）
- **说明**: 重试日志保留时间（小时）
- **示例**: `RETRY_LOG_STORAGE_HOURS=168`

### LOG_DETAIL_STORAGE_HOURS
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `72`（3天）
- **说明**: 详细日志保留时间（小时）
- **示例**: `LOG_DETAIL_STORAGE_HOURS=24`

### SAVE_ALL_LOG_DETAIL
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 保存所有请求详情（包括成功的请求）
- **注意**: 启用后会占用更多存储空间
- **示例**: `SAVE_ALL_LOG_DETAIL=true`

### LOG_DETAIL_REQUEST_BODY_MAX_SIZE
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `8192`（8KB）
- **说明**: 请求 Body 最大记录大小（字节）
- **示例**: `LOG_DETAIL_REQUEST_BODY_MAX_SIZE=16384`

### LOG_DETAIL_RESPONSE_BODY_MAX_SIZE
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `8192`（8KB）
- **说明**: 响应 Body 最大记录大小（字节）
- **示例**: `LOG_DETAIL_RESPONSE_BODY_MAX_SIZE=16384`

### CLEAN_LOG_BATCH_SIZE
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `10000`
- **说明**: 日志清理批次大小
- **示例**: `CLEAN_LOG_BATCH_SIZE=5000`

---

## 🔐 安全配置

### INTERNAL_TOKEN
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 内部 Token（用于内部服务间调用）
- **示例**: `INTERNAL_TOKEN=internal-secret-token`

### IP_GROUPS_THRESHOLD
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `100`
- **说明**: IP 分组阈值（每分钟请求数，用于检测异常行为）
- **示例**: `IP_GROUPS_THRESHOLD=200`

### IP_GROUPS_BAN_THRESHOLD
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `200`
- **说明**: IP 分组封禁阈值
- **示例**: `IP_GROUPS_BAN_THRESHOLD=500`

---

## ⚙️ 功能开关

### DISABLE_SERVE
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 禁用服务（维护模式）
- **示例**: `DISABLE_SERVE=true`

### DISABLE_WEB
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 禁用 Web 管理后台
- **示例**: `DISABLE_WEB=true`

### WEB_PATH
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `./public/dist`
- **说明**: Web 静态文件路径
- **示例**: `WEB_PATH=/var/www/aiproxy`

### DISABLE_MODEL_CONFIG
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 禁用模型配置功能
- **示例**: `DISABLE_MODEL_CONFIG=true`

### FFMPEG_ENABLED
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: 启用 FFmpeg（用于音频处理）
- **前提**: 需要系统安装 FFmpeg
- **示例**: `FFMPEG_ENABLED=true`

---

## 🔄 重试与限流配置

### RETRY_TIMES
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `3`
- **说明**: 默认重试次数
- **示例**: `RETRY_TIMES=5`

### FUZZY_TOKEN_THRESHOLD
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `0`（始终精确计算）
- **说明**: 模糊 Token 计算阈值（字符数）
- **行为**: 当文本长度超过此值时，使用近似计算（长度/4）
- **示例**: `FUZZY_TOKEN_THRESHOLD=240000`

---

## 💰 配额与计费配置

### GROUP_MAX_TOKEN_NUM
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `0`（无限制）
- **说明**: 组织最大 Token 数量
- **示例**: `GROUP_MAX_TOKEN_NUM=1000`

### GROUP_CONSUME_LEVEL_RATIO
- **类型**: JSON (map[float64]float64)
- **必需**: ❌ 否
- **默认值**: `{}`
- **说明**: 组织消费等级比例
- **格式**: 等级:折扣比例
- **示例**: `GROUP_CONSUME_LEVEL_RATIO={"1":1,"2":0.9,"3":0.8}`
- **解释**: 等级1按原价，等级2打9折，等级3打8折

---

## 🔔 告警配置

### DEFAULT_WARN_NOTIFY_ERROR_RATE
- **类型**: Float64
- **必需**: ❌ 否
- **默认值**: `0.5`（50%）
- **说明**: 默认错误率告警阈值
- **范围**: 0-1
- **示例**: `DEFAULT_WARN_NOTIFY_ERROR_RATE=0.3`

### USAGE_ALERT_THRESHOLD
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `0`（禁用）
- **说明**: 使用量告警阈值（单位：美元或配额）
- **示例**: `USAGE_ALERT_THRESHOLD=100`

### USAGE_ALERT_MIN_AVG_THRESHOLD
- **类型**: Int64
- **必需**: ❌ 否
- **默认值**: `0`（无限制）
- **说明**: 使用量告警最小平均阈值（前三天平均用量）
- **示例**: `USAGE_ALERT_MIN_AVG_THRESHOLD=10`

### USAGE_ALERT_WHITELIST
- **类型**: JSON ([]string)
- **必需**: ❌ 否
- **默认值**: `[]`
- **说明**: 使用量告警白名单（组织 ID 列表）
- **示例**: `USAGE_ALERT_WHITELIST=["group1","group2"]`

### NOTIFY_FEISHU_WEBHOOK
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 飞书 Webhook URL（用于发送告警通知）
- **示例**: `NOTIFY_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx`

### NOTIFY_NOTE
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 通知备注（附加在通知消息中）
- **示例**: `NOTIFY_NOTE=生产环境告警`

---

## 🌐 Sealos 集成配置

### SEALOS_JWT_KEY
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: Sealos JWT Key（用于 Sealos 平台集成）
- **示例**: `SEALOS_JWT_KEY=your-sealos-jwt-key`

### SEALOS_ACCOUNT_URL
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `http://account-service.account-system.svc.cluster.local:2333`
- **说明**: Sealos 账户服务 URL
- **示例**: `SEALOS_ACCOUNT_URL=http://account-service:2333`

### BALANCE_SEALOS_CHECK_REAL_NAME_ENABLE
- **类型**: Boolean
- **必需**: ❌ 否
- **默认值**: `false`
- **说明**: Sealos 实名认证检查
- **示例**: `BALANCE_SEALOS_CHECK_REAL_NAME_ENABLE=true`

### BALANCE_SEALOS_NO_REAL_NAME_USED_AMOUNT_LIMIT
- **类型**: Float64
- **必需**: ❌ 否
- **默认值**: `1.0`
- **说明**: Sealos 未实名用户使用额度限制（美元）
- **示例**: `BALANCE_SEALOS_NO_REAL_NAME_USED_AMOUNT_LIMIT=5.0`

---

## 🔗 MCP (Model Context Protocol) 配置

### DEFAULT_MCP_HOST
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 默认 MCP Host
- **示例**: `DEFAULT_MCP_HOST=http://localhost:8080`

### PUBLIC_MCP_HOST
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 公共 MCP Host
- **示例**: `PUBLIC_MCP_HOST=http://public-mcp.example.com`

### GROUP_MCP_HOST
- **类型**: String
- **必需**: ❌ 否
- **默认值**: 无
- **说明**: 分组 MCP Host
- **示例**: `GROUP_MCP_HOST=http://group-mcp.example.com`

---

## 🎛️ 高级配置

### CONFIG_FILE_PATH
- **类型**: String
- **必需**: ❌ 否
- **默认值**: `./config.yaml`
- **说明**: 配置文件路径（YAML 格式）
- **示例**: `CONFIG_FILE_PATH=/etc/aiproxy/config.yaml`

### DEFAULT_CHANNEL_MODELS
- **类型**: JSON (map[int][]string)
- **必需**: ❌ 否
- **默认值**: `{}`
- **说明**: 默认通道模型列表
- **格式**: 通道类型:模型列表
- **示例**: `DEFAULT_CHANNEL_MODELS={"1":["gpt-4","gpt-3.5-turbo"],"2":["claude-3-opus"]}`

### DEFAULT_CHANNEL_MODEL_MAPPING
- **类型**: JSON (map[int]map[string]string)
- **必需**: ❌ 否
- **默认值**: `{}`
- **说明**: 默认通道模型映射
- **格式**: 通道类型:{原始模型:实际模型}
- **示例**: `DEFAULT_CHANNEL_MODEL_MAPPING={"1":{"gpt-4":"gpt-4-0613"},"2":{"claude-3":"claude-3-opus"}}`

---

## 📖 使用说明

### 环境变量加载顺序

应用按以下顺序加载环境变量文件：

1. `.env`
2. `.env.local`
3. `.env.aiproxy.local`（ADMIN_KEY 自动生成位置）

后加载的文件会覆盖先加载文件中的同名变量。

### 配置优先级

```
环境变量（最高）
    ↓
.env 文件
    ↓
config.yaml 配置文件
    ↓
数据库配置（最低）
```

### 类型说明

- **String**: 字符串类型
- **Boolean**: 布尔类型（`true`/`false`）
- **Int64**: 整数类型
- **Float64**: 浮点数类型
- **JSON**: JSON 格式字符串

### 布尔值格式

支持以下格式（不区分大小写）：

- `true`, `1`, `yes`, `y`, `on` → true
- `false`, `0`, `no`, `n`, `off` → false

### JSON 格式示例

```bash
# 对象
GROUP_CONSUME_LEVEL_RATIO={"1":1,"2":0.9,"3":0.8}

# 数组
USAGE_ALERT_WHITELIST=["group1","group2","group3"]

# 嵌套对象
DEFAULT_CHANNEL_MODEL_MAPPING={"1":{"gpt-4":"gpt-4-0613"},"2":{"claude-3":"claude-3-opus"}}
```

---

## 🔍 查看当前配置

启动应用后，查看日志可以看到：

```
INFO loaded env file: /path/to/.env
INFO loaded env file: /path/to/.env.local
```

---

## 📚 相关文档

- [QUICKSTART.md](QUICKSTART.md) - 快速启动指南
- [DATABASE.md](DATABASE.md) - 数据库配置
- [config.md](config.md) - 配置文件说明
- [core/.env.example](core/.env.example) - 环境变量示例文件
