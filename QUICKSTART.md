# AI Proxy 快速启动指南

## 🚀 本地开发启动步骤

### 前提条件

确保已启动 MySQL 和 Redis：

```bash
docker-compose up -d
```

### VSCode 调试启动

1. 打开 VSCode
2. 按 `F5` 或点击「运行和调试」
3. 选择 **"Launch AIProxy"**

应用会自动：
- 加载 `core/.env` 中的环境变量
- 启动应用并附加调试器

### 验证启动成功

访问以下地址：
- **健康检查**: http://localhost:3000/api/status
- **Swagger API**: http://localhost:3000/swagger/index.html
- **管理后台**: http://localhost:3000

---

## 📦 中间件配置

### MySQL
- **端口**: 3306
- **数据库**: aiproxy
- **用户**: root
- **密码**: password
- **DSN**: `root:password@tcp(localhost:3306)/aiproxy?charset=utf8mb4&parseTime=True&loc=Local`
- **数据目录**: `./data/mysql`

**连接命令**:
```bash
docker exec -it aiproxy-mysql mysql -uroot -ppassword aiproxy
```

### Redis
- **端口**: 6379
- **数据目录**: `./data/redis`

**连接命令**:
```bash
docker exec -it aiproxy-redis redis-cli
```

### 数据库表初始化

数据库表会在 **应用首次启动时自动创建**，无需手动初始化。

应用使用 GORM 的 `AutoMigrate` 功能，启动时会自动：
- 创建所有必需的表
- 添加索引和外键
- 更新表结构（如果有变化）

详细说明请查看 [DATABASE.md](DATABASE.md)

---

## 🔧 环境变量

环境变量配置在 `core/.env` 文件中，VSCode 调试会自动加载。

**核心配置**（已在 `core/.env` 中配置）：
```bash
ADMIN_KEY=aiproxy-local-dev
SQL_DSN=root:password@tcp(localhost:3306)/aiproxy?charset=utf8mb4&parseTime=True&loc=Local
REDIS=redis://localhost:6379
DEBUG=true
```

**修改配置**：
- 编辑 `core/.env` 文件
- 所有支持的环境变量请查看 `core/.env.example`

**环境变量优先级**：
1. 系统环境变量（最高）
2. `core/.env` 文件
3. 配置文件（config.yaml）
4. 数据库配置（最低）

---

## 🛠️ 常用命令

### 中间件管理

```bash
# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据（慎用）
docker-compose down -v
```

### 连接数据库

```bash
# MySQL
docker exec -it aiproxy-mysql mysql -uroot -ppassword aiproxy

# Redis
docker exec -it aiproxy-redis redis-cli
```

### 手动启动应用（不使用 VSCode）

```bash
cd core
export ADMIN_KEY=aiproxy-local-dev
export SQL_DSN="root:password@tcp(localhost:3306)/aiproxy?charset=utf8mb4&parseTime=True&loc=Local"
export REDIS="redis://localhost:6379"
go run . -listen 0.0.0.0:3000
```

---

## 🐛 调试技巧

### 设置断点
在代码行号左侧点击，红点即为断点

### 查看变量
鼠标悬停在变量上查看值

### 调用堆栈
在调试面板查看完整的调用堆栈

### 条件断点
右键点击断点，设置条件表达式

---

## ❓ 常见问题

### Q: 启动报错 `dial tcp 127.0.0.1:3306: connect: connection refused`

**A**: MySQL 未启动，运行：
```bash
docker-compose up -d mysql
```

### Q: 如何修改数据库密码？

**A**: 修改 `docker-compose.yaml` 和 `.vscode/launch.json` 中的密码配置

### Q: 数据在哪里？

**A**:
- MySQL: `./data/mysql/`
- Redis: `./data/redis/`

### Q: 如何清空数据库重新开始？

**A**:
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📚 相关文档

- [README.md](README.md) - 项目介绍
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构文档
- [config.md](config.md) - 配置说明
