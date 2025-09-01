# 🔧 設置持久性 Slack Webhook 完整指南

## 🎯 目標：創建一個不會消失的 Slack Webhook

### 📱 步驟 1: 創建或選擇 Slack App
1. 前往 https://api.slack.com/apps
2. **選擇現有 App** (使用你的 Bot Token `xoxb-9395393333280-9381929851874`)
   - 或 **創建新 App** → "From scratch" → 輸入 App 名稱

### 📱 步驟 2: 正確配置 Incoming Webhooks
1. 左側選單 → **"Incoming Webhooks"**
2. 確保 **"Activate Incoming Webhooks"** 切換為 **ON** ✅
3. 滾動到底部 → 點選 **"Add New Webhook to Workspace"**

### 📱 步驟 3: 授權到你的 Workspace
1. 選擇要接收通知的 **Channel** (例如: #general, #notifications)
2. 點選 **"Allow"** 授權
3. **重要：確保授權成功完成**

### 📱 步驟 4: 驗證 Webhook 已保存
1. 回到 "Incoming Webhooks" 頁面
2. 應該看到新的 webhook 出現在列表中：
   ```
   Webhook URL    Channel    Added By
   https://hooks.slack.com/services/T.../B.../xxx  #your-channel  Your Name
   ```

### 📱 步驟 5: 複製並測試
1. 複製完整的 Webhook URL
2. 使用我們的測試工具驗證：
   ```bash
   node test-new-slack-webhook.js "你的新webhook_url"
   ```

## 🚨 常見問題排除

### ❌ 如果 Webhook 仍然消失：
1. **檢查 App 權限**：
   - App 可能沒有正確安裝到 workspace
   - 檢查 "OAuth & Permissions" 頁面

2. **檢查 Workspace 設置**：
   - 你的 Slack workspace 管理員可能有限制
   - 確認你有安裝 App 的權限

3. **重新創建 App**：
   - 有時候舊的 App 會有問題
   - 創建全新的 Slack App 通常能解決

### ✅ 成功的標誌：
- Webhook URL 持續顯示在列表中
- 測試訊息能正常發送
- Channel 中收到測試訊息

## 🔗 相關連結
- Slack Apps 管理: https://api.slack.com/apps
- Incoming Webhooks 文檔: https://api.slack.com/messaging/webhooks
- 疑難排解: https://api.slack.com/messaging/webhooks#troubleshooting