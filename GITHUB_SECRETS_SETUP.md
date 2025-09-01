# 🔐 GitHub Secrets 設置指南

## 需要設置的 Secrets

前往 GitHub Repository: https://github.com/angushyx/MCP-demo-calculator/settings/secrets/actions

### 1. SLACK_BOT_TOKEN
```
名稱: SLACK_BOT_TOKEN
值: xoxb-你的-slack-bot-token
```

### 2. NOTION_API_KEY  
```
名稱: NOTION_API_KEY
值: ntn_你的-notion-api-key
```

## 設置步驟

1. 打開 GitHub Repository
2. Settings → Secrets and variables → Actions
3. 點擊 "New repository secret"
4. 輸入名稱和值
5. 點擊 "Add secret"

## 如何獲取 Tokens

### Slack Bot Token:
1. 前往 https://api.slack.com/apps
2. 選擇你的 App
3. OAuth & Permissions → Bot User OAuth Token
4. 複製以 `xoxb-` 開頭的 token

### Notion API Key:
1. 前往 https://www.notion.so/my-integrations
2. 創建新的 integration
3. 複製 Internal Integration Token
4. 確保 integration 有你的頁面存取權限

---
✅ 設置完成後，GitHub Actions 會自動使用這些 secrets