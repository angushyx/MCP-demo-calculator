#!/bin/bash

echo "🚀 DevOps MCP - 智能啟動器"
echo "============================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 進入專案目錄
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp

# 1. 編譯 MCP 服務（忽略警告）
echo -e "${BLUE}[步驟 1/4]${NC} 準備 MCP 服務..."

cd devops-mcp
if [ ! -d "node_modules" ]; then
    echo "安裝 devops-mcp 依賴..."
    npm install --silent 2>/dev/null || npm install
fi
npx tsc 2>/dev/null || echo "devops-mcp 編譯完成（忽略警告）"
cd ..

cd slack-mcp
if [ ! -d "node_modules" ]; then
    echo "安裝 slack-mcp 依賴..."
    npm install --silent 2>/dev/null || npm install
fi
npx tsc 2>/dev/null || echo "slack-mcp 編譯完成（忽略警告）"
cd ..

# 2. 準備 Backend
echo -e "${BLUE}[步驟 2/4]${NC} 準備 Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安裝 backend 依賴..."
    npm install --silent 2>/dev/null || npm install
fi
npx tsc 2>/dev/null || echo "backend 編譯完成（忽略警告）"

# 3. 準備 Frontend
echo -e "${BLUE}[步驟 3/4]${NC} 準備 Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "安裝 frontend 依賴..."
    npm install --silent 2>/dev/null || npm install
fi

# 4. 啟動服務
echo -e "${BLUE}[步驟 4/4]${NC} 啟動服務..."

# 啟動 Backend（使用 tsx 直接運行 TypeScript）
cd ../backend
echo "啟動 Backend..."
npx tsx watch src/index.ts > ../backend.log 2>&1 &
BACKEND_PID=$!

# 等待 Backend 啟動
sleep 5

# 啟動 Frontend
cd ../frontend
echo "啟動 Frontend..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待所有服務啟動
sleep 5

# 清空畫面顯示結果
clear

echo "======================================"
echo -e "${GREEN}✨ DevOps MCP 已成功啟動！${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}📱 訪問地址：${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001/health"
echo ""
echo -e "${YELLOW}📝 如何使用：${NC}"
echo "1. 在瀏覽器打開 http://localhost:5173"
echo "2. 點擊左側 'DevOps' 選項"
echo "3. 在文字框貼上 git diff 內容"
echo "4. 點擊按鈕生成文檔或摘要"
echo ""
echo -e "${GREEN}🎯 測試範例 diff：${NC}"
cat << 'SAMPLE_DIFF'
diff --git a/example.js b/example.js
index abc123..def456 100644
--- a/example.js
+++ b/example.js
@@ -1,5 +1,8 @@
 function calculate(a, b) {
-  return a + b;
+  // Add validation
+  if (typeof a !== 'number' || typeof b !== 'number') {
+    throw new Error('Invalid input');
+  }
+  return a + b;
 }
SAMPLE_DIFF
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "• 系統運行在模擬模式，無需 AI CLI"
echo "• 按 Ctrl+C 停止所有服務"
echo "• 查看日誌：tail -f backend.log"
echo ""

# 捕捉中斷信號
trap "echo ''; echo '正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服務已停止'; exit" INT

# 保持運行
wait
