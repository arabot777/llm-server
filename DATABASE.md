# 数据库配置说明

## 📦 数据库账号密码

### MySQL

根据 [docker-compose.yaml](docker-compose.yaml) 配置：

```yaml
MYSQL_ROOT_PASSWORD: password
MYSQL_DATABASE: aiproxy
```

**连接信息**:
- **主机**: localhost
- **端口**: 3306
- **数据库**: aiproxy
- **用户**: root
- **密码**: password
- **DSN**: `root:password@tcp(localhost:3306)/aiproxy?charset=utf8mb4&parseTime=True&loc=Local`

**连接命令**:
```bash
# Docker 内连接
docker exec -it aiproxy-mysql mysql -uroot -ppassword aiproxy

# 本地客户端连接
mysql -h 127.0.0.1 -P 3306 -uroot -ppassword aiproxy

# GUI 工具连接 (例如 Navicat, DBeaver, DataGrip)
Host: localhost
Port: 3306
Database: aiproxy
Username: root
Password: password
```

### Redis

**连接信息**:
- **主机**: localhost
- **端口**: 6379
- **密码**: 无
- **DSN**: `redis://localhost:6379`

**连接命令**:
```bash
# Docker 内连接
docker exec -it aiproxy-redis redis-cli

# 本地客户端连接
redis-cli -h localhost -p 6379
```

---

## 🔄 数据库表初始化

### 自动初始化时机

数据库表会在 **应用启动时自动初始化**，具体流程：

1. **启动入口**: `core/main.go` 启动时调用 `model.InitDB()`
2. **数据库迁移**: 使用 GORM 的 `AutoMigrate` 功能自动创建表
3. **迁移时机**: 每次应用启动时检查并更新表结构

### 初始化的表

根据 `core/model/main.go` 第 142-153 行：

```go
err := DB.AutoMigrate(
    &Channel{},            // 通道表（AI 提供商配置）
    &ChannelTest{},        // 通道测试表
    &Token{},              // API Token 表
    &PublicMCP{},          // 公共 MCP 服务器表
    &GroupModelConfig{},   // 分组模型配置表
    &PublicMCPReusingParam{}, // MCP 复用参数表
    &GroupMCP{},           // 分组 MCP 表
    &Group{},              // 组织表
    &Option{},             // 系统选项表
    &ModelConfig{},        // 模型配置表
)
```

### 日志表初始化

应用启动时还会初始化日志表（`model.InitLogDB()`）：

```go
// 日志相关表
&Log{}              // 请求日志表
&Summary{}          // 汇总统计表
&SummaryMinute{}    // 分钟级统计表
&GroupSummary{}     // 分组汇总表
```

### 初始化流程

```
应用启动
    ↓
main.go
    ↓
model.InitDB()
    ├─ 1. 连接数据库（根据 SQL_DSN 环境变量）
    ├─ 2. 执行 migrateDB()
    │     └─ AutoMigrate 创建/更新表结构
    └─ 3. 完成初始化
    ↓
model.InitLogDB()
    ├─ 1. 连接日志数据库（根据 LOG_SQL_DSN，默认使用主库）
    ├─ 2. 执行 migrateLogDB()
    │     └─ AutoMigrate 创建/更新日志表
    └─ 3. 完成初始化
    ↓
应用正常运行
```

---

## 🔧 数据库配置选项

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `SQL_DSN` | 主数据库连接 | `root:password@tcp(localhost:3306)/aiproxy?charset=utf8mb4&parseTime=True&loc=Local` |
| `LOG_SQL_DSN` | 日志数据库连接（可选） | `root:password@tcp(localhost:3306)/aiproxy_log?charset=utf8mb4&parseTime=True&loc=Local` |
| `DISABLE_AUTO_MIGRATE_DB` | 禁用自动迁移（可选） | `true` |
| `DEBUG_SQL_ENABLED` | 启用 SQL 调试日志（可选） | `true` |

### 数据库类型检测

应用会根据 `SQL_DSN` 的前缀自动选择数据库类型：

```go
switch {
case strings.HasPrefix(dsn, "postgres"):
    // 使用 PostgreSQL
    return OpenPostgreSQL(dsn)

case strings.HasPrefix(dsn, "mysql://"):
    // 使用 MySQL
    return OpenMySQL(dsn)

default:
    // 使用 SQLite (如果 SQL_DSN 为空或其他值)
    return OpenSQLite(sqlitePath)
}
```

---

## 📊 查看表结构

### 启动后查看

应用首次启动后，可以连接数据库查看自动创建的表：

```bash
# 连接 MySQL
docker exec -it aiproxy-mysql mysql -uroot -ppassword aiproxy

# 查看所有表
mysql> SHOW TABLES;

# 查看表结构
mysql> DESCRIBE channels;
mysql> DESCRIBE tokens;
mysql> DESCRIBE logs;
```

### 预期的表列表

主数据库表：
- `channels` - 通道配置
- `channel_tests` - 通道测试
- `tokens` - API Token
- `groups` - 组织
- `group_model_configs` - 分组模型配置
- `group_mcps` - 分组 MCP
- `public_mcps` - 公共 MCP
- `public_mcp_reusing_params` - MCP 复用参数
- `options` - 系统选项
- `model_configs` - 模型配置

日志数据库表：
- `logs` - 请求日志
- `summaries` - 汇总统计
- `summary_minutes` - 分钟级统计
- `group_summaries` - 分组汇总

---

## 🔄 数据库迁移规则

### GORM AutoMigrate 行为

根据 `core/model/main.go` 配置：

```go
&gorm.Config{
    DisableForeignKeyConstraintWhenMigrating: false,  // 创建外键约束
    IgnoreRelationshipsWhenMigrating:         false,  // 处理关联关系
}
```

**AutoMigrate 会做什么**:
- ✅ 自动创建不存在的表
- ✅ 自动添加新增的列
- ✅ 自动创建索引
- ✅ 自动创建外键约束
- ❌ **不会删除**未使用的列
- ❌ **不会修改**已存在列的类型

### 手动迁移

如果需要禁用自动迁移：

```bash
export DISABLE_AUTO_MIGRATE_DB=true
```

然后手动执行数据库迁移脚本。

---

## 🛠️ 数据库管理

### 重置数据库

```bash
# 停止服务并删除数据
docker-compose down -v

# 重新启动（会重新初始化空数据库）
docker-compose up -d

# 启动应用（会自动创建表结构）
cd core
go run .
```

### 备份数据库

```bash
# MySQL 备份
docker exec aiproxy-mysql mysqldump -uroot -ppassword aiproxy > backup.sql

# 恢复
docker exec -i aiproxy-mysql mysql -uroot -ppassword aiproxy < backup.sql
```

### 查看数据库日志

```bash
# MySQL 日志
docker-compose logs -f mysql

# 应用的 SQL 日志（需要设置 DEBUG_SQL_ENABLED=true）
```

---

## 📝 初始化验证

### 检查表是否创建成功

应用启动后，查看日志：

```
INFO database migration started
INFO database migrated
INFO log database migration started
INFO log database migrated
```

如果看到以上日志，说明数据库表已成功初始化。

### 常见错误

#### 错误 1: 无法连接数据库

```
failed to initialize database: dial tcp 127.0.0.1:3306: connect: connection refused
```

**原因**: MySQL 服务未启动

**解决**:
```bash
docker-compose up -d mysql
```

#### 错误 2: 数据库不存在

```
Error 1049: Unknown database 'aiproxy'
```

**原因**: 数据库未创建（但使用 docker-compose 不应出现此问题）

**解决**: docker-compose 会自动创建 `aiproxy` 数据库

#### 错误 3: 权限错误

```
Error 1045: Access denied for user 'root'@'localhost'
```

**原因**: 密码错误

**解决**: 检查 `SQL_DSN` 中的密码是否与 docker-compose.yaml 一致

---

## 💡 最佳实践

### 开发环境

1. **使用 Docker Compose**: 确保环境一致性
2. **启用 SQL 日志**: 便于调试
   ```bash
   export DEBUG_SQL_ENABLED=true
   ```
3. **定期备份**: 避免数据丢失

### 生产环境

1. **分离日志数据库**: 使用 `LOG_SQL_DSN` 配置独立的日志数据库
2. **禁用 SQL 日志**: 避免性能影响
3. **定期备份**: 设置自动备份任务
4. **监控连接数**: 调整 `maxIdleConns` 和 `maxOpenConns`

---

## 🔗 相关文件

- [docker-compose.yaml](docker-compose.yaml) - 数据库服务配置
- [core/model/main.go](core/model/main.go) - 数据库初始化逻辑
- [.vscode/launch.json](.vscode/launch.json) - 包含数据库连接配置
