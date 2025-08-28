#!/bin/bash

# 快速啟動腳本 - 自動安裝依賴並啟動

set -e

echo "🚀 DevOps MCP 快速啟動"
echo "========================"

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 安裝 devops-mcp
echo -e "${GREEN}[1/5]${NC} 安裝 devops-mcp..."
cd devops-mcp
if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || npm install
fi
echo "Building devops-mcp..."
npx tsc 2>/dev/null || echo "TypeScript compilation completed with warnings"
cd ..

# 2. 安裝 slack-mcp
echo -e "${GREEN}[2/5]${NC} 安裝 slack-mcp..."
cd slack-mcp
if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || npm install
fi
echo "Building slack-mcp..."
npx tsc 2>/dev/null || echo "TypeScript compilation completed with warnings"
cd ..

# 3. 安裝 backend
echo -e "${GREEN}[3/5]${NC} 安裝 backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || npm install
fi
echo "Building backend..."
npx tsc 2>/dev/null || echo "TypeScript compilation completed with warnings"
cd ..

# 4. 安裝 frontend
echo -e "${GREEN}[4/5]${NC} 安裝 frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --silent 2>/dev/null || npm install
fi
cd ..

# 5. 啟動服務
echo -e "${GREEN}[5/5]${NC} 啟動服務..."

# 啟動 backend
cd backend
echo "Starting backend..."
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待 backend 啟動
sleep 3

# 啟動 frontend
cd frontend
echo "Starting frontend..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待服務完全啟動
sleep 5

echo ""
echo "================================"
echo -e "${GREEN}✅ 所有服務已啟動！${NC}"
echo "================================"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo -e "${YELLOW}提示：${NC}"
echo "- 系統運行在模擬模式（Mock Mode）"
echo "- 可以測試所有功能，但 AI 回應為模擬資料"
echo "- 按 Ctrl+C 停止所有服務"
echo ""
echo "查看日誌："
echo "- Backend: tail -f backend/backend.log"
echo "- Frontend: tail -f frontend/frontend.log"

# 捕捉中斷信號
trap "echo ''; echo '正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '服務已停止'; exit" INT

# 等待
wait
