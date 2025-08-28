# 🚀 DevOps MCP - 快速啟動指南

## 方法 1：一鍵啟動（推薦）

打開 Terminal，複製並執行以下命令：

```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
chmod +x one-click-start.sh
./one-click-start.sh
```

等待約 1-2 分鐘，直到看到 "✨ DevOps MCP 已啟動！"

然後在瀏覽器訪問：http://localhost:5173

## 方法 2：手動啟動（分步驟）

### 步驟 1：安裝 devops-mcp
```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp/devops-mcp
npm install
npx tsc
```

### 步驟 2：安裝 slack-mcp
```bash
cd ../slack-mcp
npm install
npx tsc
```

### 步驟 3：安裝並啟動 backend
```bash
cd ../backend
npm install
npx tsc
npm run dev
```

### 步驟 4：開新的 Terminal 視窗，安裝並啟動 frontend
```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp/frontend
npm install
npm run dev
```

### 步驟 5：訪問應用
打開瀏覽器，訪問 http://localhost:5173

## 🎯 功能測試

1. 在 DevOps 面板的文字框中貼上以下測試 diff：

```diff
diff --git a/test.js b/test.js
index abc123..def456 100644
--- a/test.js
+++ b/test.js
@@ -1,5 +1,7 @@
 function hello() {
-  console.log("Hello");
+  console.log("Hello World");
+  // Added new feature
+  return true;
 }
```

2. 點擊 "Generate Patch" 或 "Summarize" 按鈕

3. 系統會返回模擬的 AI 分析結果

## ⚠️ 注意事項

- 目前系統運行在**模擬模式**（Mock Mode）
- AI 回應為示例資料，不是真實的 AI 分析
- 若要使用真實 AI，需要配置 `claude-code` 或其他 LLM CLI

## 🛑 停止服務

在 Terminal 中按 `Ctrl+C` 即可停止所有服務

## 🔧 故障排除

### 如果 5173 端口被佔用：
```bash
# 查找佔用端口的程序
lsof -i :5173
# 結束該程序
kill -9 <PID>
```

### 如果 3001 端口被佔用：
```bash
lsof -i :3001
kill -9 <PID>
```

### 如果 npm install 失敗：
```bash
# 清理快取
npm cache clean --force
# 重新安裝
rm -rf node_modules package-lock.json
npm install
```

## 📝 環境變數配置

如需配置真實的 Slack 整合，編輯 `backend/.env`：

```env
SLACK_BOT_TOKEN=xoxb-your-real-token
SLACK_SIGNING_SECRET=your-real-secret
```

---

專案位置：`/Users/angushyx/Desktop/mcp-multi-service/devops-mcp`
