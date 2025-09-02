#!/bin/bash

# 🏠 本機 MCP 執行器啟動腳本

echo "🏠 本機 MCP 執行器"
echo "=================="

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

# 檢查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️ 未找到 .env 文件"
    echo "💡 請複製 .env.example 為 .env 並填入你的 API keys"
    echo ""
    echo "cp .env.example .env"
    echo "然後編輯 .env 文件填入你的 API keys"
    exit 1
fi

# 載入環境變數
set -a
source .env
set +a

echo "🔧 檢查 MCP 服務依賴..."

# 安裝 MCP 服務依賴
for service in "devops-mcp/notion-mcp" "devops-mcp/slack-mcp" "devops-mcp/claude-code-reviewer"; do
    if [ -d "$service" ]; then
        echo "📦 安裝 $service 依賴..."
        (cd "$service" && npm install --silent)
    fi
done

echo "🚀 啟動本機 MCP 執行器..."
echo ""

# 執行本機 MCP
node local-mcp-runner.js

echo ""
echo "✨ 本機 MCP 執行完成！"
echo "📱 請查看你的 Slack 和 Notion 確認結果"