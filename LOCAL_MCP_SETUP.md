# 🏠 本機 MCP 執行器設定指南

## 🎯 為什麼選擇本機執行？

✅ **完全控制** - 在你的電腦上執行，完整控制流程  
✅ **即時回饋** - 直接看到所有日誌和結果  
✅ **API Key 安全** - 不需要上傳到 GitHub Secrets  
✅ **無限制** - 不受 GitHub Actions 的時間和資源限制  
✅ **更好除錯** - 可以修改和測試 MCP 服務  

## 🚀 快速開始

### 1️⃣ 複製環境變數文件
```bash
cp .env.example .env
```

### 2️⃣ 填入你的 API Keys
編輯 `.env` 文件：
```env
# Claude/Anthropic API Key
CLAUDE_API_KEY=sk-ant-your-actual-key-here

# Notion API Key  
NOTION_API_KEY=ntn_your-actual-key-here

# Slack Bot Token
SLACK_BOT_TOKEN=xoxb-your-actual-token-here
```

### 3️⃣ 執行本機 MCP
```bash
./run-local-mcp.sh
```

## 🔧 詳細設定

### 獲取 API Keys

#### 🤖 Claude API Key
1. 前往 https://console.anthropic.com/
2. 創建 API Key
3. 複製 `sk-ant-` 開頭的 key

#### 📝 Notion API Key  
1. 前往 https://www.notion.so/my-integrations
2. 創建新的 integration
3. 複製 `ntn_` 開頭的 token
4. 確保 integration 有頁面存取權限

#### 💬 Slack Bot Token
1. 前往 https://api.slack.com/apps
2. 選擇你的 App
3. OAuth & Permissions → Bot User OAuth Token
4. 複製 `xoxb-` 開頭的 token

## 🔄 執行流程

當你運行本機 MCP 時：

```
🏠 你的電腦
    ↓
📊 獲取最新 Git Commit 資訊
    ↓  
🤖 Claude Code Reviewer (本機執行)
    ↓
📝 Notion MCP 服務 (本機執行)  
    ↓
💬 Slack MCP 服務 (本機執行)
    ↓
✅ 完整結果回報
```

## 🧪 測試方式

1. **修改任何代碼文件**
2. **提交變更**: `git add . && git commit -m "測試本機 MCP"`
3. **運行本機 MCP**: `./run-local-mcp.sh`
4. **查看結果**:
   - 📱 Slack #all-ags-mcp 收到通知
   - 📝 Notion 創建新頁面
   - 💻 終端機顯示完整日誌

## 🎛️ 進階配置

### 自動監控模式 (選填)
如果你想要自動監控 git 變更：

```bash
node local-mcp-runner.js --watch
```

### 自訂 MCP 服務
你可以修改 `local-mcp-runner.js` 中的服務配置：

```javascript
MCP_SERVICES: {
    claude: './devops-mcp/claude-code-reviewer/index.js',
    notion: './devops-mcp/notion-mcp/index.js', 
    slack: './devops-mcp/slack-mcp/index.js'
}
```

## 🔍 除錯

### 檢查日誌
本機執行會顯示所有 MCP 服務的詳細日誌：
```
📤 Claude Reviewer: ✅ Notion MCP running with REAL API
📤 Notion: 🔗 Creating real Notion page
📤 Slack: 💬 調用 Slack MCP 服務
```

### 常見問題

**Q: API Key 無效？**  
A: 檢查 `.env` 文件中的 API key 格式和有效性

**Q: Notion 頁面創建失敗？**  
A: 確認 Notion integration 有正確的頁面權限

**Q: Slack 通知失敗？**  
A: 確認 Bot 已被邀請到 #all-ags-mcp channel

## 🎉 成功指標

當本機 MCP 成功執行時，你會看到：

✅ **終端機**: 
```
🎉 所有 MCP 服務執行成功！
📊 總體成功率: 3/3 (100%)
```

✅ **Slack**: 收到包含完整分析的通知  
✅ **Notion**: 創建包含 Claude 審查結果的新頁面

---
🏠 現在你有完全控制的 MCP 自動化流程了！