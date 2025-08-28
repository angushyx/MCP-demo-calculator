# 🧮 MCP Calculator Demo 範例

## 📋 完整演示流程

### 步驟 1: 修改計算機功能

讓我們添加一個新的「歷史記錄」功能來觸發 MCP 自動化。

#### 新增功能：計算歷史查看器

```javascript
// 在 calculator.js 中添加
showHistory() {
    const historyDiv = document.createElement('div');
    historyDiv.className = 'calculation-history';
    historyDiv.innerHTML = `
        <h3>📊 計算歷史</h3>
        <div class="history-list">
            ${this.history.map(item => 
                `<div class="history-item">
                    <span class="expression">${item.expression}</span> = 
                    <span class="result">${item.result}</span>
                    <small class="timestamp">${item.timestamp}</small>
                </div>`
            ).join('')}
        </div>
        <button onclick="this.parentElement.remove()">關閉</button>
    `;
    document.body.appendChild(historyDiv);
}
```

### 步驟 2: Git 提交並推送

```bash
# 創建新的功能分支
git checkout -b feature/history-viewer

# 添加新功能到計算器
echo '
// 計算歷史查看功能 - Demo 範例
function showCalculationHistory() {
    const history = calc.getHistory();
    if (history.length === 0) {
        alert("📊 尚無計算歷史");
        return;
    }
    
    const historyWindow = window.open("", "history", "width=400,height=600");
    historyWindow.document.write(`
        <html>
        <head>
            <title>📊 計算歷史</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .history-item { 
                    border-bottom: 1px solid #eee; 
                    padding: 10px 0; 
                }
                .expression { font-weight: bold; color: #333; }
                .result { color: #28a745; }
                .timestamp { color: #666; font-size: 0.8em; }
            </style>
        </head>
        <body>
            <h2>📊 計算歷史</h2>
            ${history.map(item => 
                `<div class="history-item">
                    <div class="expression">${item.expression} = <span class="result">${item.result}</span></div>
                    <div class="timestamp">${item.timestamp}</div>
                </div>`
            ).join("")}
        </body>
        </html>
    `);
}

console.log("✨ 歷史查看功能已載入");' >> src/calculator.js

# 添加歷史按鈕到 HTML
sed -i '' '/<div class="advanced-buttons">/a\
                <button class="btn btn-history" onclick="showCalculationHistory()">📊</button>' index.html

# 添加歷史按鈕樣式
echo '
.btn-history {
    background: linear-gradient(145deg, #17a2b8, #138496);
    color: white;
    box-shadow: 0 3px 8px rgba(23, 162, 184, 0.3);
}

.btn-history:hover {
    background: linear-gradient(145deg, #138496, #0f5963);
}' >> src/styles.css

# 提交變更
git add .
git commit -m "✨ feat: Add calculation history viewer

- Added showCalculationHistory() function for viewing past calculations
- Created popup window with formatted history display
- Added history button to calculator UI with teal styling
- Enhanced user experience with calculation tracking

Features:
- View all previous calculations in chronological order
- Clean popup interface with timestamp information
- Integrated seamlessly with existing calculator functionality
- Responsive design matching calculator theme

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 推送到 GitHub 觸發 CI/CD
git push origin feature/history-viewer
```

### 步驟 3: 預期的自動化結果

#### 🤖 GitHub Actions 會自動：

1. **程式碼分析**:
   - 檢測到新增了 50+ 行程式碼
   - 識別出添加了新功能「計算歷史查看器」
   - 分析程式碼品質和潛在問題

2. **MCP AI 分析**:
   ```json
   {
     "summary": "Added calculation history viewer feature",
     "changes": [
       "New showCalculationHistory() function",
       "History button in UI",
       "Popup window for history display"
     ],
     "impact": "Enhanced user experience",
     "recommendations": [
       "Add unit tests for history functionality",
       "Consider adding export/clear history options"
     ]
   }
   ```

3. **自動創建 Notion 頁面**:
   ```
   標題: "🧮 Calculator v1.3.0 - History Viewer Feature"
   
   內容:
   ## 📋 發佈摘要
   - **版本**: feature/history-viewer-v123
   - **作者**: angushyx
   - **日期**: 2025-08-28
   - **變更**: 1 檔案, +52 行, -0 行
   
   ## ✨ 新功能
   - 計算歷史查看器
   - 彈出視窗介面
   - 時間戳記錄
   
   ## 🔍 AI 建議
   - 添加單元測試
   - 考慮匯出/清除功能
   
   ## 📊 變更詳情
   [程式碼 diff 內容...]
   ```

4. **Slack 通知訊息**:
   ```
   🧮 Calculator App Release: feature/history-viewer-v123
   
   📦 Repository: angushyx/MCP-demo-calculator
   🚀 Version: feature/history-viewer-v123  
   👤 Author: angushyx
   🌿 Branch: feature/history-viewer
   
   💬 Commit Message: ✨ feat: Add calculation history viewer
   
   📊 Stats:
   • Files Changed: 3
   • Insertions: +52
   • Deletions: -0
   
   [📋 View Release Notes] [💻 View Commit]
   ```

### 步驟 4: 測試完整功能

```bash
# 1. 開啟計算機
open index.html

# 2. 執行一些計算
# - 2 + 3 = 5
# - sqrt(16) = 4  
# - 100 USD → TWD (使用貨幣轉換)

# 3. 點擊歷史按鈕 📊
# 應該看到所有計算記錄的彈出視窗

# 4. 檢查 GitHub Actions
# https://github.com/angushyx/MCP-demo-calculator/actions

# 5. 查看 Notion 頁面
# 應該自動創建新的發佈頁面

# 6. 檢查 Slack 通知
# 在你的頻道中應該收到自動通知
```

## 🎯 快速測試指令

```bash
# 一鍵執行完整 demo
./demo-mcp-calculator.sh change  # 創建 demo 變更
git push origin $(git branch --show-current)  # 推送觸發自動化

# 或者執行預設的測試流程
./demo-mcp-calculator.sh demo
```

## 📊 監控自動化結果

### GitHub Actions 狀態：
- 🟢 通過：MCP 自動化成功
- 🟡 進行中：正在處理分析
- 🔴 失敗：檢查日誌排錯

### MCP 服務健康：
```bash
# 檢查 MCP 服務狀態
./demo-mcp-calculator.sh health

# 測試 Notion 連接
./demo-mcp-calculator.sh notion

# 查看服務日誌
tail -f devops-mcp/backend.log
```

## 🎉 成功指標

當你看到以下情況，表示 MCP 自動化完全成功：

✅ GitHub Actions 顯示綠色通過  
✅ Notion 中出現新的發佈頁面  
✅ Slack 收到格式化的通知訊息  
✅ 計算機新功能正常運作  
✅ MCP 服務日誌顯示成功處理  

---

這就是完整的 MCP Calculator 自動化 Demo！🚀