# Smart Workspace Assistant + DevOps MCP Integration

這是一個整合了 DevOps AI 文件生成工具和 Slack 整合的智慧工作空間助手。專案使用 MCP (Model Context Protocol) 架構，提供 diff 摘要和文件 patch 生成功能。

## 🚀 功能特點

- **DevOps MCP**: 使用本地 LLM CLI 生成文件 patch 和差異摘要
- **Slack MCP**: 整合 Slack，支援 slash commands 和事件訂閱
- **Web UI**: React 前端提供直觀的操作介面
- **容器化部署**: 支援 Docker 和 Kubernetes 部署
- **CI/CD**: 內建 GitHub Actions 和 Jenkins 支援

## 📁 專案結構

```
devops-mcp/
├── devops-mcp/        # MCP 工具：產生 patch / 摘要
├── slack-mcp/         # MCP 工具：Slack 整合
├── backend/           # Express + MCP client
├── frontend/          # React 前端
├── jenkins/           # Jenkins CI 配置
├── deploy/k8s/        # Kubernetes 部署檔案
└── .github/workflows/ # GitHub Actions CI/CD
```

## 🛠️ 本機開發

### 前置需求

- Node.js 20+
- npm 或 pnpm
- Docker (選用)
- claude-code CLI (或其他 LLM CLI)

### 安裝步驟

1. **安裝 devops-mcp**
```bash
cd devops-mcp
npm install
npm run build
```

2. **安裝 slack-mcp** (選用)
```bash
cd ../slack-mcp
npm install
npm run build
```

3. **設定並啟動 backend**
```bash
cd ../backend
cp .env.example .env
# 編輯 .env 填入必要的環境變數
npm install
npm run dev
```

4. **啟動 frontend**
```bash
cd ../frontend
npm install
npm run dev
```

開啟瀏覽器訪問 [http://localhost:5173](http://localhost:5173)

## 🐳 Docker 部署

使用 Docker Compose 一鍵啟動：

```bash
docker compose up --build
```

## ☸️ Kubernetes 部署

### 設定步驟

1. **替換佔位符**

編輯 `deploy/k8s/*.yaml` 檔案，替換以下佔位符：
- `<ORG>`: 你的 GitHub 組織名稱
- `<REPO>`: 你的 repository 名稱
- `<NAMESPACE>`: Kubernetes 命名空間（預設 workspace）
- `<DOMAIN>`: 你的域名

2. **建立 Secret**

```bash
kubectl create namespace workspace

kubectl create secret generic backend-secrets \
  --from-literal=API_KEY=your-api-key \
  --from-literal=SLACK_SIGNING_SECRET=your-slack-secret \
  --from-literal=SLACK_BOT_TOKEN=xoxb-your-token \
  -n workspace

kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n workspace
```

3. **部署應用**

```bash
kubectl apply -f deploy/k8s/
```

## 🔧 API 端點

### DevOps AI API

- `POST /api/devops/ai/generate-patch`
  - Body: `{ diff: string, maxChars?: number }`
  - Response: 文字格式的 unified diff patch

- `POST /api/devops/ai/summarize`
  - Body: `{ diff: string }`
  - Response: Markdown 格式的摘要

- `GET /api/devops/ai/collect-diff`
  - Query: `?repoDir=.&baseRef=origin/main&headRef=`
  - Response: unified diff 文字

### Slack Webhooks

- `POST /api/slack/events` - Slack 事件訂閱
- `POST /api/slack/commands` - Slash commands 處理

## 🔌 Slack 整合

### 設定 Slack App

1. 訪問 [api.slack.com/apps](https://api.slack.com/apps)
2. 建立新的 App（From an app manifest）
3. 使用 `slack/app-manifest.yaml` 的內容（記得替換 `<DOMAIN>`）
4. 安裝 App 到你的 workspace
5. 複製 Bot Token 和 Signing Secret 到環境變數

### Slash Commands

- `/ai-summary [diff]` - 生成 diff 摘要
- `/ai-docs [diff]` - 生成文件 patch

## 🚀 GitHub Actions CI/CD

### 設定 Repository Secrets

在 GitHub repository 設定以下 secrets：

- `KUBE_CONFIG_DATA`: base64 編碼的 kubeconfig
- `API_KEY`: API 金鑰
- `SLACK_SIGNING_SECRET`: Slack signing secret
- `SLACK_BOT_TOKEN`: Slack bot token

### 設定 Repository Variables

- `DOMAIN`: 你的應用域名

推送到 `main` 分支將自動觸發建置和部署。

## 🔨 Jenkins 整合

使用 `jenkins/Jenkinsfile` 配置 Jenkins pipeline，自動生成文件 patch 並套用。

## 📝 環境變數說明

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `PORT` | Backend 服務埠 | 3001 |
| `FRONTEND_URL` | 前端 URL | http://localhost:5173 |
| `AI_CLI` | LLM CLI 命令 | claude-code |
| `MAX_CHARS` | 單次處理最大字元數 | 12000 |
| `SLACK_SIGNING_SECRET` | Slack 簽名密鑰 | - |
| `SLACK_BOT_TOKEN` | Slack Bot Token | - |
| `API_KEY` | API 存取金鑰 | - |

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## ⚠️ 注意事項

- MCP 服務以 stdio 子程序在 backend 容器內執行
- 確保 `claude-code` CLI 已安裝並可執行
- Slack 整合需要公開的 HTTPS 端點
- 敏感資訊請使用 Kubernetes Secrets 或環境變數管理

## 🆘 故障排除

### MCP 連接失敗

確認 MCP 工具已正確編譯：
```bash
cd devops-mcp && npm run build
cd ../slack-mcp && npm run build
```

### Slack 驗證失敗

檢查 Signing Secret 是否正確，並確認時間同步。

### LLM CLI 錯誤

確認 `claude-code` 或其他 LLM CLI 已安裝並在 PATH 中。

---

如有問題，請開啟 Issue 或聯繫維護者。
