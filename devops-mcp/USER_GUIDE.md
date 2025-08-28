# 📚 DevOps MCP 使用指南

## 🚀 快速開始

### 1. 啟動應用

打開 Terminal，執行以下命令：

```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
chmod +x run.sh
./run.sh
```

等待看到 "✨ DevOps MCP 已成功啟動！" 訊息。

### 2. 訪問應用

在瀏覽器中打開：**http://localhost:5173**

## 📱 使用步驟

### 步驟 1：進入 DevOps 面板
- 打開應用後，點擊左側選單的 **"DevOps"** 按鈕

### 步驟 2：貼上 Diff
在文字框中貼上你的 git diff 內容，例如：

```diff
diff --git a/src/api.js b/src/api.js
index 123abc..456def 100644
--- a/src/api.js
+++ b/src/api.js
@@ -10,7 +10,12 @@ class APIClient {
   constructor(baseURL) {
     this.baseURL = baseURL;
   }
   
-  async get(endpoint) {
+  /**
+   * Fetch data from API endpoint
+   * @param {string} endpoint - API endpoint path
+   * @returns {Promise<Object>} Response data
+   */
+  async get(endpoint, options = {}) {
     const response = await fetch(this.baseURL + endpoint);
     return response.json();
   }
```

### 步驟 3：選擇功能

#### 🔧 Generate Patch（生成文檔補丁）
- 點擊 **"Generate Patch"** 按鈕
- 系統會分析你的代碼變更，生成建議的文檔補丁
- 補丁會包含：
  - JSDoc/TSDoc 註釋
  - README 更新建議
  - CHANGELOG 條目

#### 📝 Summarize（生成摘要）
- 點擊 **"Summarize"** 按鈕
- 系統會生成變更摘要，包含：
  - 高影響變更
  - 受影響的模組
  - 建議的文檔更新
  - 潛在的測試缺口

## 🎯 實用範例

### 範例 1：新增功能
```diff
diff --git a/auth.js b/auth.js
index 111111..222222 100644
--- a/auth.js
+++ b/auth.js
@@ -5,6 +5,15 @@ class Auth {
     this.users = new Map();
   }
   
+  async login(username, password) {
+    const user = this.users.get(username);
+    if (!user) {
+      throw new Error('User not found');
+    }
+    const isValid = await bcrypt.compare(password, user.passwordHash);
+    return isValid ? this.generateToken(user) : null;
+  }
+  
   register(username, password) {
     // existing code
   }
```

### 範例 2：重構代碼
```diff
diff --git a/database.js b/database.js
index aaa111..bbb222 100644
--- a/database.js
+++ b/database.js
@@ -10,8 +10,12 @@ class Database {
-  connect() {
-    this.connection = mysql.createConnection(this.config);
+  async connect() {
+    try {
+      this.connection = await mysql.createConnection(this.config);
+      console.log('Database connected successfully');
+    } catch (error) {
+      console.error('Database connection failed:', error);
+      throw error;
+    }
   }
```

## 💡 進階功能

### 1. 批量處理
你可以貼上包含多個文件的 diff：
```diff
diff --git a/file1.js b/file1.js
...
diff --git a/file2.js b/file2.js
...
```

### 2. 大型 Diff
系統會自動分塊處理大型 diff，確保生成品質。

## 🔧 配置選項

### 環境變數（backend/.env）

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `PORT` | Backend 端口 | 3001 |
| `AI_CLI` | AI CLI 命令 | echo（模擬模式）|
| `MAX_CHARS` | 單次處理字元數上限 | 12000 |

### 切換到真實 AI 模式

1. 安裝 AI CLI（如 claude-code）
2. 編輯 `backend/.env`：
```env
AI_CLI=claude-code
```
3. 重啟服務

## 🐛 故障排除

### 問題：TypeScript 編譯錯誤
**解決方案**：這些警告可以忽略，不影響運行。

### 問題：端口被佔用
**解決方案**：
```bash
# 查看佔用端口的程序
lsof -i :5173
lsof -i :3001

# 結束程序
kill -9 <PID>
```

### 問題：服務無法啟動
**解決方案**：
```bash
# 清理並重新安裝
rm -rf */node_modules
./run.sh
```

### 問題：無法訪問 http://localhost:5173
**解決方案**：
1. 確認服務已啟動（Terminal 顯示成功訊息）
2. 檢查防火牆設定
3. 嘗試使用 http://127.0.0.1:5173

## 📊 輸出範例

### Generate Patch 輸出
```diff
diff --git a/README.md b/README.md
index 123456..789abc 100644
--- a/README.md
+++ b/README.md
@@ -10,6 +10,8 @@
 ## API Documentation
 
+### Authentication
+- `login(username, password)`: Authenticates user and returns JWT token
+
 ## Usage
```

### Summarize 輸出
```markdown
## Diff Summary

### High-Impact Changes
- Added user authentication with JWT
- Implemented async database connection
- Added error handling for edge cases

### Affected Modules
- auth.js: New login functionality
- database.js: Async connection handling

### Suggested Updates
- README: Document new authentication API
- CHANGELOG: Add v2.0.0 entry for auth feature
```

## 🎉 恭喜！

你現在已經可以開始使用 DevOps MCP 了！這個工具可以幫助你：
- 自動生成代碼文檔
- 快速總結代碼變更
- 保持文檔與代碼同步
- 提高代碼審查效率

如有任何問題，請查看 backend.log 和 frontend.log 日誌文件。
