# 🚀 MCP CI/CD Pipeline 設置指南

## 📋 概覽

這個 CI/CD Pipeline 會在每次程式碼推送或 PR 時自動執行以下流程：

1. **代碼分析** - 使用 MCP AI 分析程式碼變更
2. **文檔生成** - 自動生成相關文檔
3. **Notion 文檔** - 為 release 創建版本化頁面
4. **Slack 通知** - 發送 release 通知到團隊

## 🔧 設置步驟

### 1. GitHub Secrets 配置

在你的 GitHub repository 中設置以下 Secrets:

```bash
# 前往 GitHub Repository > Settings > Secrets and variables > Actions
# 點擊 "New repository secret" 並添加以下內容：

MCP_SERVICE_URL=https://your-ngrok-url.ngrok-free.app
MCP_API_TOKEN=mcp_secure_token_2024_devops
NOTION_API_KEY=ntn_f60904852272g19VvtkBtnTXg5coABK4QN4lnCmn9eS3Bk
NOTION_DATABASE_ID=25316b056deb80889948cd2a79d92e1e
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. 本地環境設置

```bash
# 1. 確保服務運行
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
docker-compose up -d

# 2. 確保 ngrok 隧道活躍
ngrok http 3001

# 3. 測試 CI/CD API 端點
curl -H "Authorization: Bearer mcp_secure_token_2024_devops" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/ci-cd/stats
```

### 3. Slack Webhook 設置

1. 前往 Slack App 設置頁面
2. 在 "Features" > "Incoming Webhooks" 中啟用 webhooks
3. 點擊 "Add New Webhook to Workspace"
4. 選擇要接收通知的頻道
5. 複製 Webhook URL 到 GitHub Secrets

### 4. Notion 資料庫設置 (可選)

如果要使用結構化的 Notion 資料庫而不是普通頁面：

1. 在 Notion 中創建新資料庫
2. 添加以下屬性：
   - **Version** (Title)
   - **Release Date** (Date)
   - **Repository** (Text)
   - **Author** (Person)
   - **Status** (Select: Draft/Released/Archived)
   - **Risk Level** (Select: Low/Medium/High)

## 🧪 測試 CI/CD Pipeline

### 本地測試

```bash
# 測試代碼分析 API
curl -X POST http://localhost:3001/api/ci-cd/analyze \
  -H "Authorization: Bearer mcp_secure_token_2024_devops" \
  -H "Content-Type: application/json" \
  -d '{
    "diff": "diff --git a/test.js b/test.js\nindex 123..456 100644\n--- a/test.js\n+++ b/test.js\n@@ -1,3 +1,5 @@\n function test() {\n+  console.log(\"Hello CI/CD!\");\n   return true;\n }",
    "metadata": {
      "repository": "test/repo",
      "branch": "feature/test",
      "commit": "abc123",
      "author": "developer",
      "changed_files": 1,
      "insertions": 1,
      "deletions": 0,
      "event_type": "push"
    }
  }'

# 測試文檔生成 API
curl -X POST http://localhost:3001/api/ci-cd/generate-docs \
  -H "Authorization: Bearer mcp_secure_token_2024_devops" \
  -H "Content-Type: application/json" \
  -d '{
    "diff": "diff --git a/README.md b/README.md\nindex 123..456 100644\n--- a/README.md\n+++ b/README.md\n@@ -1,3 +1,5 @@\n # Project Title\n+## New Feature\n+Added CI/CD integration\n This is a test.",
    "version": "v1.2.3",
    "metadata": {
      "repository": "test/repo",
      "commit": "abc123"
    }
  }'
```

### GitHub Actions 測試

1. **推送測試**: 對任何分支進行推送
   ```bash
   git add .
   git commit -m "test: CI/CD pipeline integration"
   git push origin your-branch
   ```

2. **PR 測試**: 創建 Pull Request
   - 會在 PR 中自動添加分析評論
   - 顯示變更統計和 AI 建議

3. **Release 測試**: 推送到 main 分支
   - 會創建 Notion 頁面
   - 發送 Slack 通知

## 📊 Pipeline 功能

### 🔍 代碼分析功能
- **智能變更檢測**: 識別功能新增、Bug 修復、重構
- **風險評估**: 基於變更規模自動評估風險等級
- **雙語分析**: 中英文對照的分析報告
- **CI/CD 特定建議**: 針對持續整合的專業建議

### 📋 Notion 整合功能
- **版本化頁面**: 每個 release 自動創建獨立頁面
- **豐富的 Metadata**: 包含完整的變更信息
- **結構化內容**: 統計數據、分析結果、建議事項
- **可追踪性**: 與 GitHub commit 關聯

### 📢 Slack 通知功能
- **Rich Message**: 使用 Slack Blocks 的豐富格式
- **快速行動**: 直接連結到 Notion 文檔和 GitHub commit
- **團隊通知**: 即時通知所有相關成員
- **可自定義**: 根據分支或變更類型調整通知

## 🛠️ 故障排除

### 常見問題

1. **API Token 認證失敗**
   ```
   Error: Unauthorized: Invalid API token
   ```
   解決方案: 檢查 GitHub Secrets 中的 `MCP_API_TOKEN` 是否與 docker-compose.yml 中一致

2. **Notion API 調用失敗**
   ```
   Error: body failed validation: body.children[0]...
   ```
   解決方案: Notion API 對內容長度有限制，系統會自動截斷過長內容

3. **Slack Webhook 失敗**
   ```
   Error: channel_not_found
   ```
   解決方案: 確認 Slack App 有權限訪問目標頻道

4. **MCP 服務連接失敗**
   ```
   Error: MCP error -32603
   ```
   解決方案: 確保 Docker 服務正常運行且 ngrok 隧道活躍

### 調試命令

```bash
# 檢查服務狀態
docker-compose ps
docker-compose logs backend

# 測試 API 連通性
curl -H "Authorization: Bearer mcp_secure_token_2024_devops" \
     http://localhost:3001/api/ci-cd/stats

# 檢查 GitHub Actions 日誌
# 前往 GitHub > Actions > 選擇具體的 workflow run
```

## 🚀 進階配置

### 自定義觸發條件

修改 `.github/workflows/mcp-analysis.yml` 中的觸發條件：

```yaml
on:
  push:
    branches: [ main, develop, release/* ]
    # 添加路徑過濾
    paths-ignore:
      - '**.md'
      - 'docs/**'
  pull_request:
    branches: [ main ]
    # 只在特定文件變更時觸發
    paths:
      - 'src/**'
      - 'lib/**'
```

### 環境特定配置

針對不同環境使用不同的配置：

```yaml
# 生產環境
- name: Production Deploy
  if: github.ref == 'refs/heads/main'
  env:
    MCP_SERVICE_URL: https://prod-mcp.yourdomain.com
    
# 測試環境  
- name: Staging Deploy
  if: github.ref == 'refs/heads/develop'
  env:
    MCP_SERVICE_URL: https://staging-mcp.yourdomain.com
```

---

## 📞 支援

如果遇到問題，請查看：
1. GitHub Actions 執行日誌
2. Docker container 日誌
3. MCP 服務健康狀態

或聯繫技術支援團隊。

**🎉 設置完成後，你的 CI/CD Pipeline 就會開始自動分析代碼變更並生成文檔！**