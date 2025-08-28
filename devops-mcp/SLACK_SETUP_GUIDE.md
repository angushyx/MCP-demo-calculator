# 🔑 Slack API 完整設定指南

## 快速開始（5分鐘搞定）

### 1️⃣ 創建 Slack App

1. **打開 Slack API 控制台**
   ```
   https://api.slack.com/apps
   ```

2. **點擊 "Create New App"**

3. **選擇 "From an app manifest"**

4. **選擇你的 Workspace**

5. **貼上以下 Manifest**：

```yaml
display_information:
  name: DevOps Assistant
  description: AI-powered DevOps assistant for code analysis
  background_color: "#2c2d30"
  
features:
  bot_user:
    display_name: DevOps Assistant
    always_online: true
    
  slash_commands:
    - command: /ai-summary
      description: Generate a summary of code changes
      usage_hint: "[paste your git diff]"
      should_escape: false
      
    - command: /ai-docs
      description: Generate documentation patches
      usage_hint: "[paste your git diff]"
      should_escape: false
      
    - command: /ai-analyze
      description: Analyze code and suggest improvements
      usage_hint: "[paste code or diff]"
      should_escape: false

oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - channels:join
      - channels:read
      - chat:write
      - chat:write.customize
      - chat:write.public
      - commands
      - files:write
      - groups:history
      - groups:read
      - groups:write
      - im:history
      - im:read
      - im:write
      - links:read
      - links:write
      - mpim:history
      - mpim:read
      - mpim:write
      - reactions:read
      - reactions:write
      - team:read
      - users:read
      - users:read.email

settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - message.channels
      - message.groups
      - message.im
      - message.mpim
      - link_shared
      
  interactivity:
    is_enabled: true
    
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

### 2️⃣ 取得 API Keys

創建 App 後，前往以下頁面取得 Keys：

#### 🔐 Bot Token
1. 左側選單點擊 **"OAuth & Permissions"**
2. 找到 **"Bot User OAuth Token"**
3. 複製 Token（格式：`xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx`）

#### 🔐 Signing Secret
1. 左側選單點擊 **"Basic Information"**
2. 在 **"App Credentials"** 區塊
3. 找到 **"Signing Secret"**
4. 點擊 **"Show"** 並複製

### 3️⃣ 設定 Webhook URLs

在 **"Event Subscriptions"** 頁面：

1. **開啟 Events**
   - Enable Events: **On**

2. **設定 Request URL**
   ```
   https://your-domain.com/api/slack/events
   ```
   
   如果在本地測試，使用 ngrok：
   ```bash
   ngrok http 3001
   ```
   然後使用 ngrok 提供的 URL：
   ```
   https://abc123.ngrok.io/api/slack/events
   ```

### 4️⃣ 設定 Slash Commands

在 **"Slash Commands"** 頁面，為每個命令設定 Request URL：

1. **/ai-summary**
   ```
   Request URL: https://your-domain.com/api/slack/commands
   ```

2. **/ai-docs**
   ```
   Request URL: https://your-domain.com/api/slack/commands
   ```

3. **/ai-analyze**
   ```
   Request URL: https://your-domain.com/api/slack/commands
   ```

### 5️⃣ 安裝到 Workspace

1. 左側選單點擊 **"Install App"**
2. 點擊 **"Install to Workspace"**
3. 授權所需權限
4. 完成！

## 🔧 設定到你的應用

### 更新 .env 檔案

編輯 `/Users/angushyx/Desktop/mcp-multi-service/devops-mcp/backend/.env`：

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-你的-bot-token
SLACK_SIGNING_SECRET=你的signing-secret
SLACK_APP_TOKEN=xapp-你的-app-token（如果使用 Socket Mode）
```

### 重啟服務

```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
./fix-and-restart.sh
```

## 🧪 測試 Slack 整合

### 1. 邀請 Bot 到頻道
在 Slack 頻道輸入：
```
/invite @DevOps Assistant
```

### 2. 測試 Slash Commands
```
/ai-summary 
diff --git a/test.js b/test.js
index 123..456 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,5 @@
 function test() {
+  // New feature
+  console.log("Hello");
 }
```

### 3. 測試 Mention
```
@DevOps Assistant 請分析這段程式碼
```

## 🌐 本地開發測試（使用 ngrok）

如果你想在本地測試 Slack 整合：

### 1. 安裝 ngrok
```bash
brew install ngrok
```

### 2. 啟動你的應用
```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
./fix-and-restart.sh
```

### 3. 啟動 ngrok
```bash
ngrok http 3001
```

### 4. 使用 ngrok URL
將 ngrok 提供的 URL（如 `https://abc123.ngrok.io`）設定到 Slack App：
- Event Subscriptions URL: `https://abc123.ngrok.io/api/slack/events`
- Slash Commands URL: `https://abc123.ngrok.io/api/slack/commands`

## 📊 完整權限說明

### 必要權限
- `chat:write` - 發送訊息
- `commands` - 接收 slash commands
- `files:write` - 上傳檔案（patch 檔案）

### 選用權限
- `channels:history` - 讀取頻道歷史
- `app_mentions:read` - 回應 @mentions
- `links:read` - 展開連結預覽

## 🔴 常見問題

### Q: Request URL 驗證失敗？
**A:** 確認你的後端正在運行，並且 URL 正確。使用 ngrok 時，每次重啟 ngrok URL 會改變。

### Q: Bot 沒有回應？
**A:** 
1. 確認 Bot 已被邀請到頻道
2. 檢查 `.env` 中的 Token 是否正確
3. 查看 `backend.log` 是否有錯誤

### Q: Signing Secret 錯誤？
**A:** 確認從 Basic Information 頁面複製的是 Signing Secret，不是 Client Secret。

### Q: 如何查看 Bot 的日誌？
```bash
tail -f backend.log
```

## 🎯 快速檢查清單

- [ ] 創建 Slack App
- [ ] 複製 Bot Token (`xoxb-...`)
- [ ] 複製 Signing Secret
- [ ] 設定 Event Subscriptions URL
- [ ] 設定 Slash Commands URLs
- [ ] 安裝 App 到 Workspace
- [ ] 更新 `.env` 檔案
- [ ] 重啟應用
- [ ] 邀請 Bot 到測試頻道
- [ ] 測試 Slash Commands

## 💡 進階功能

### 1. Interactive Components（按鈕）
可以添加互動按鈕，讓使用者選擇操作：
```javascript
{
  "text": "選擇操作",
  "attachments": [{
    "callback_id": "devops_action",
    "actions": [
      { "name": "approve", "text": "核准", "type": "button", "value": "approve" },
      { "name": "reject", "text": "拒絕", "type": "button", "value": "reject" }
    ]
  }]
}
```

### 2. Scheduled Messages
定時發送報告：
```javascript
// 每天早上 9 點發送昨日程式碼分析報告
```

### 3. Workflow Builder
整合 Slack Workflow Builder，創建自動化流程。

---

完成以上步驟後，你的 Slack 整合就可以使用了！

需要幫助嗎？我可以協助你：
1. 設定 ngrok 進行本地測試
2. 調試 Webhook 問題
3. 新增更多 Slash Commands
