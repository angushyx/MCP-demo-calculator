#!/bin/bash

echo "🚀 DevOps MCP - 超簡化啟動"
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

echo "📦 安裝依賴（這可能需要幾分鐘）..."

# 並行安裝所有依賴
(cd devops-mcp && npm install && npx tsc) &
(cd slack-mcp && npm install && npx tsc) &
(cd backend && npm install && npx tsc) &
(cd frontend && npm install) &

# 等待所有安裝完成
wait

echo ""
echo "✅ 依賴安裝完成！"
echo ""
echo "🔧 啟動後端服務..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 5

echo "🌐 啟動前端服務..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 5

echo ""
echo "======================================"
echo "✨ DevOps MCP 已啟動！"
echo "======================================"
echo ""
echo "請在瀏覽器中訪問："
echo "👉 http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服務"
echo ""

# 等待中斷
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
