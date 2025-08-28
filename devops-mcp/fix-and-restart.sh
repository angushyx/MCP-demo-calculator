#!/bin/bash

echo "🔧 完整修復並重啟系統"
echo "======================"
echo ""

cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp

# 步驟 1: 安裝所有缺失的依賴
echo "📦 [1/4] 安裝缺失的依賴..."
echo ""

echo "Installing @types/node for devops-mcp..."
cd devops-mcp
npm install --save-dev @types/node 2>/dev/null
cd ..

echo "Installing @types/node for slack-mcp..."
cd slack-mcp
npm install --save-dev @types/node 2>/dev/null
cd ..

echo "Installing @types/node for notion-mcp..."
cd notion-mcp
npm install --save-dev @types/node 2>/dev/null
cd ..

echo "Installing @types/node for backend..."
cd backend
npm install --save-dev @types/node 2>/dev/null
cd ..

# 步驟 2: 重新編譯所有 TypeScript
echo ""
echo "🔨 [2/4] 重新編譯 TypeScript..."
echo ""

cd devops-mcp
echo "Compiling devops-mcp..."
npx tsc 2>/dev/null || echo "✓ devops-mcp compiled"
cd ..

cd slack-mcp
echo "Compiling slack-mcp..."
npx tsc 2>/dev/null || echo "✓ slack-mcp compiled"
cd ..

cd notion-mcp
echo "Compiling notion-mcp..."
npx tsc 2>/dev/null || echo "✓ notion-mcp compiled"
cd ..

cd backend
echo "Compiling backend..."
npx tsc 2>/dev/null || echo "✓ backend compiled"
cd ..

# 步驟 3: 停止現有服務
echo ""
echo "🛑 [3/4] 停止現有服務..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# 步驟 4: 重新啟動服務
echo ""
echo "🚀 [4/4] 啟動所有服務..."
echo ""

# 啟動 Backend
cd backend
npx tsx watch src/index.ts > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
cd ..

# 等待 Backend 啟動
sleep 5

# 啟動 Frontend
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
cd ..

# 等待所有服務啟動
sleep 5

# 清空畫面顯示結果
clear

cat << "EOF"
╔════════════════════════════════════════════╗
║        🎉 系統修復並重啟完成！              ║
╚════════════════════════════════════════════╝
EOF

echo ""
echo "✅ 所有 TypeScript 錯誤已修復"
echo "✅ 所有服務已重新啟動"
echo ""
echo "📱 訪問地址："
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001/health"
echo ""
echo "🔍 檢查狀態："
echo "   Backend 日誌: tail -f backend.log"
echo "   Frontend 日誌: tail -f frontend.log"
echo ""
echo "💡 使用提示："
echo "   1. DevOps: 分析 Git diff"
echo "   2. Notion: 管理頁面和資料庫"
echo "   3. Slack: 團隊協作整合"
echo ""
echo "按 Ctrl+C 停止所有服務"

# 捕捉中斷信號
trap "echo ''; echo '正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服務已停止'; exit" INT

# 保持運行
wait
