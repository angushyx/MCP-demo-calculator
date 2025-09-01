# 🔗 創建永久 Slack Webhook 完整指南

## 🎯 目標：創建一個真正永久的 Webhook

### 📱 正確的步驟（避免消失）

#### 1. 使用現有的 Slack App（推薦）
1. 前往 https://api.slack.com/apps
2. 找到你的現有 Slack App

#### 2. 正確啟用 Incoming Webhooks
1. 左側選單 → **"Incoming Webhooks"**
2. 確保 **"Activate Incoming Webhooks"** 是 **ON** ✅
3. **重要**: 不要點擊舊的 "Add New Webhook to Workspace"

#### 3. 使用正確的方法添加 Webhook
1. 滾動到頁面底部的 **"Webhook URLs for Your Workspace"** 區域
2. 點擊 **"Add New Webhook to Workspace"** 按鈕
3. **選擇 Channel**: 選擇 #all-ags-mcp
4. 點擊 **"Allow"** 完成授權
5. **等待頁面刷新** - 這很重要！

#### 4. 驗證 Webhook 已正確保存
確保在 "Webhook URLs for Your Workspace" 看到：
```
Webhook URL                                          Channel        Added By
https://hooks.slack.com/services/T.../B.../xxx      #all-ags-mcp   Your Name
```

#### 5. 複製完整的 Webhook URL
URL 格式：`https://hooks.slack.com/services/T.../B.../新的token`

## 🚨 避免 Webhook 消失的關鍵點

### ✅ 正確做法：
- 使用現有的、已安裝的 Slack App
- 確保 App 有正確的權限
- 選擇你有管理員權限的 Channel
- 等待授權完成後再複製 URL
- 不要在創建後立即測試（等待幾分鐘）

### ❌ 避免的錯誤：
- 不要使用臨時或測試 App
- 不要選擇你沒有權限的 Channel
- 不要在創建過程中刷新頁面
- 不要創建多個重複的 Webhook

## 🧪 測試新 Webhook
創建後請使用這個命令測試：
```bash
curl -X POST "你的新webhook_url" \
  -H "Content-type: application/json" \
  -d '{"text":"🧪 永久 Webhook 測試"}'
```

或使用我們的測試工具：
```bash
node test-permanent-webhook.js "你的新webhook_url"
```