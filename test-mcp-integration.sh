#!/bin/bash
# MCP Calculator Demo 完整測試腳本
set -e

echo "🧮 MCP Calculator Demo - 完整測試系統"
echo "======================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 檢查 MCP 服務狀態
check_mcp_service() {
    echo -e "${BLUE}🔍 檢查 MCP 服務狀態...${NC}"
    
    # 檢查後端服務
    if pgrep -f "tsx watch src/index.ts" > /dev/null; then
        echo -e "${GREEN}✅ MCP 後端服務正在運行${NC}"
    else
        echo -e "${RED}❌ MCP 後端服務未運行${NC}"
        echo -e "${YELLOW}請先執行: cd devops-mcp && ./start.sh${NC}"
        exit 1
    fi
    
    # 檢查前端服務
    if pgrep -f "vite" > /dev/null; then
        echo -e "${GREEN}✅ MCP 前端服務正在運行${NC}"
    else
        echo -e "${YELLOW}⚠️  MCP 前端服務未運行 (可選)${NC}"
    fi
    
    # 檢查 port 3001
    if lsof -i :3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Port 3001 已開放${NC}"
    else
        echo -e "${RED}❌ Port 3001 未開放${NC}"
    fi
}

# 測試 Notion MCP 功能
test_notion_mcp() {
    echo -e "\n${PURPLE}📋 測試 Notion MCP 功能...${NC}"
    
    # 模擬 CI/CD 分析請求
    ANALYSIS_PAYLOAD='{
        "diff": "--- a/src/calculator.js\n+++ b/src/calculator.js\n@@ -1,5 +1,10 @@\n class Calculator {\n+    // 新增貨幣轉換功能\n     constructor() {\n+        this.currencyRates = {};\n         this.display = document.getElementById(\"display\");\n     }\n+\n+    convertCurrency(amount, from, to) {\n+        return amount * this.currencyRates[to] / this.currencyRates[from];\n+    }\n }",
        "metadata": {
            "repository": "angushyx/MCP-demo-calculator",
            "branch": "main",
            "commit": "abc123def456",
            "author": "angushyx",
            "changed_files": 3,
            "insertions": 25,
            "deletions": 5,
            "event_type": "push"
        }
    }'
    
    echo "🔄 發送分析請求到 MCP 服務..."
    RESPONSE=$(curl -s -X POST http://localhost:3001/api/ci-cd/analyze \
        -H "Content-Type: application/json" \
        -d "$ANALYSIS_PAYLOAD" 2>/dev/null || echo '{"error": "Connection failed"}')
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Notion MCP 測試失敗${NC}"
        echo "Response: $RESPONSE"
    else
        echo -e "${GREEN}✅ Notion MCP 測試成功${NC}"
        echo "Response preview: $(echo $RESPONSE | jq -r '.summary // .message // "Analysis completed"' 2>/dev/null || echo "$RESPONSE")"
    fi
}

# 測試 Slack MCP 功能
test_slack_mcp() {
    echo -e "\n${CYAN}💬 測試 Slack MCP 功能...${NC}"
    
    # 模擬發佈通知
    SLACK_PAYLOAD='{
        "text": "🧮 Calculator App Release: v1.2.0",
        "version": "v1.2.0",
        "repository": "angushyx/MCP-demo-calculator",
        "author": "angushyx",
        "changes": "Added currency converter functionality",
        "stats": {
            "files_changed": 3,
            "insertions": 25,
            "deletions": 5
        }
    }'
    
    echo "🔄 發送 Slack 通知到 MCP 服務..."
    RESPONSE=$(curl -s -X POST http://localhost:3001/api/ci-cd/slack-notify \
        -H "Content-Type: application/json" \
        -d "$SLACK_PAYLOAD" 2>/dev/null || echo '{"error": "Connection failed"}')
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Slack MCP 測試失敗${NC}"
        echo "Response: $RESPONSE"
    else
        echo -e "${GREEN}✅ Slack MCP 測試成功${NC}"
        echo "Response: $(echo $RESPONSE | jq -r '.message // "Notification sent"' 2>/dev/null || echo "$RESPONSE")"
    fi
}

# 創建測試 Pull Request
create_test_pr() {
    echo -e "\n${YELLOW}🔄 創建測試 Pull Request...${NC}"
    
    # 創建測試分支
    TEST_BRANCH="test-mcp-integration-$(date +%s)"
    git checkout -b "$TEST_BRANCH" 2>/dev/null || true
    
    # 添加測試變更
    echo "/* MCP Integration Test - $(date) */" >> src/calculator.js
    git add src/calculator.js
    git commit -m "🧪 test: MCP integration test

- Added test comment for MCP CI/CD pipeline testing
- Currency converter functionality active
- Testing automated Notion and Slack integration

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "No changes to commit"
    
    echo -e "${GREEN}✅ 測試分支已創建: $TEST_BRANCH${NC}"
    echo -e "${BLUE}ℹ️  推送到 GitHub 來觸發 CI/CD pipeline:${NC}"
    echo "git push origin $TEST_BRANCH"
}

# 演示完整流程
demo_full_flow() {
    echo -e "\n${PURPLE}🎬 完整 MCP Demo 流程${NC}"
    echo "========================"
    
    echo -e "${BLUE}1. 開啟計算機應用${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "open index.html"
        # open index.html 2>/dev/null || echo "請手動開啟 index.html"
    else
        echo "請在瀏覽器中開啟: file://$(pwd)/index.html"
    fi
    
    echo -e "\n${BLUE}2. 測試計算功能${NC}"
    echo "- 基本計算: 2 + 3 * 4 = 14"
    echo "- 高級函數: sqrt(16) = 4"
    echo "- 貨幣轉換: 100 USD → TWD"
    
    echo -e "\n${BLUE}3. 查看 MCP 日誌${NC}"
    echo "tail -f devops-mcp/backend.log"
    
    echo -e "\n${BLUE}4. 觸發 CI/CD Pipeline${NC}"
    echo "git push origin <branch-name>"
    
    echo -e "\n${BLUE}5. 檢查自動化結果${NC}"
    echo "- GitHub Actions: https://github.com/angushyx/MCP-demo-calculator/actions"
    echo "- Notion 頁面: 自動創建的發佈筆記"
    echo "- Slack 通知: #your-channel 中的自動通知"
}

# 顯示 MCP 服務端點
show_endpoints() {
    echo -e "\n${CYAN}🔗 MCP 服務端點${NC}"
    echo "==================="
    echo "• 分析端點: http://localhost:3001/api/ci-cd/analyze"
    echo "• 文檔生成: http://localhost:3001/api/ci-cd/generate-docs"
    echo "• Notion 創建: http://localhost:3001/api/ci-cd/create-release-page"
    echo "• Slack 通知: http://localhost:3001/api/ci-cd/slack-notify"
    echo "• 健康檢查: http://localhost:3001/health"
}

# 檢查和安裝依賴
check_dependencies() {
    echo -e "\n${BLUE}🔧 檢查依賴...${NC}"
    
    # 檢查必要工具
    for cmd in curl jq git node; do
        if command -v $cmd &> /dev/null; then
            echo -e "${GREEN}✅ $cmd 已安裝${NC}"
        else
            echo -e "${RED}❌ $cmd 未安裝${NC}"
            case $cmd in
                jq) echo "安裝: brew install jq" ;;
                node) echo "安裝: https://nodejs.org/" ;;
            esac
        fi
    done
}

# 主要執行流程
main() {
    case ${1:-"all"} in
        "check")
            check_mcp_service
            ;;
        "notion")
            test_notion_mcp
            ;;
        "slack") 
            test_slack_mcp
            ;;
        "pr")
            create_test_pr
            ;;
        "demo")
            demo_full_flow
            ;;
        "deps")
            check_dependencies
            ;;
        "endpoints")
            show_endpoints
            ;;
        "all")
            check_dependencies
            check_mcp_service
            test_notion_mcp
            test_slack_mcp
            show_endpoints
            echo -e "\n${GREEN}🎉 MCP 整合測試完成！${NC}"
            echo -e "${YELLOW}💡 執行 './test-mcp-integration.sh demo' 查看完整演示流程${NC}"
            ;;
        *)
            echo "用法: $0 [check|notion|slack|pr|demo|deps|endpoints|all]"
            exit 1
            ;;
    esac
}

# 執行主函數
main "$@"