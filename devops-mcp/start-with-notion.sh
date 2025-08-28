#!/bin/bash

echo "🚀 DevOps MCP with Notion Integration"
echo "======================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 進入專案目錄
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp

# 安裝並編譯 MCP 服務
echo -e "${BLUE}[1/5]${NC} 準備 MCP 服務..."

# DevOps MCP
cd devops-mcp
if [ ! -d "node_modules" ]; then
    echo "Installing devops-mcp dependencies..."
    npm install --silent
fi
echo "Building devops-mcp..."
npx tsc 2>/dev/null || true
cd ..

# Slack MCP
cd slack-mcp
if [ ! -d "node_modules" ]; then
    echo "Installing slack-mcp dependencies..."
    npm install --silent
fi
echo "Building slack-mcp..."
npx tsc 2>/dev/null || true
cd ..

# Notion MCP
echo -e "${BLUE}[2/5]${NC} 準備 Notion MCP..."
cd notion-mcp
if [ ! -d "node_modules" ]; then
    echo "Installing notion-mcp dependencies..."
    npm install --silent
fi
echo "Building notion-mcp..."
npx tsc 2>/dev/null || true
cd ..

# Backend
echo -e "${BLUE}[3/5]${NC} 準備 Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --silent
fi
echo "Building backend..."
npx tsc 2>/dev/null || true

# Frontend
echo -e "${BLUE}[4/5]${NC} 準備 Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --silent
fi

# 啟動服務
echo -e "${BLUE}[5/5]${NC} 啟動所有服務..."

# 啟動 Backend
cd ../backend
echo "Starting Backend with all MCP services..."
npx tsx watch src/index.ts > ../backend.log 2>&1 &
BACKEND_PID=$!

# 等待 Backend 啟動
sleep 5

# 啟動 Frontend
cd ../frontend
echo "Starting Frontend..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待所有服務啟動
sleep 5

# 清空畫面顯示結果
clear

cat << "EOF"
╔════════════════════════════════════════════╗
║     🚀 DevOps MCP + Notion Integration     ║
║           Successfully Started!             ║
╚════════════════════════════════════════════╝
EOF

echo ""
echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo -e "${BLUE}📱 Access Points:${NC}"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3001/health"
echo ""
echo -e "${YELLOW}🔧 Available Features:${NC}"
echo "   • DevOps:  AI-powered diff analysis & documentation"
echo "   • Notion:  Search, create pages, manage databases"
echo "   • Slack:   Slash commands for team collaboration"
echo ""
echo -e "${GREEN}📝 Notion Features (Mock Mode):${NC}"
echo "   1. Search for pages"
echo "   2. Create new pages"
echo "   3. Manage database items"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • System running in Mock Mode (no API keys needed)"
echo "   • Press Ctrl+C to stop all services"
echo "   • Check logs: tail -f backend.log or frontend.log"
echo ""
echo -e "${BLUE}🔑 To use real Notion API:${NC}"
echo "   1. Get API key from https://www.notion.so/my-integrations"
echo "   2. Add to backend/.env: NOTION_API_KEY=your-key"
echo "   3. Share Notion pages with your integration"
echo ""

# 捕捉中斷信號
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ All services stopped'; exit" INT

# 保持運行
wait
