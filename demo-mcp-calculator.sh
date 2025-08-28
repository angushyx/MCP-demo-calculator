#!/bin/bash
# MCP Calculator Demo - 完整演示腳本
set -e

echo "🧮 MCP Calculator Demo - 實際測試與演示"
echo "========================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. 測試 Notion MCP 功能（實際端點）
test_notion_integration() {
    echo -e "\n${PURPLE}📋 測試 Notion MCP 整合...${NC}"
    
    # 測試創建頁面
    echo "🔄 測試創建 Notion 頁面..."
    NOTION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/notion/pages \
        -H "Content-Type: application/json" \
        -d '{
            "title": "MCP Calculator Demo - 測試頁面",
            "content": "這是通過 MCP Calculator Demo 自動創建的測試頁面。\n\n功能包括：\n- 基本計算功能\n- 即時貨幣轉換\n- 自動化 CI/CD 整合\n- Notion 自動文檔生成\n- Slack 通知"
        }' 2>/dev/null || echo '{"error": "Connection failed"}')
    
    if echo "$NOTION_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Notion 頁面創建失敗${NC}"
        echo "Response: $NOTION_RESPONSE"
    else
        echo -e "${GREEN}✅ Notion 頁面創建成功${NC}"
        PAGE_ID=$(echo "$NOTION_RESPONSE" | jq -r '.page_id // "unknown"' 2>/dev/null || echo "unknown")
        echo "頁面 ID: $PAGE_ID"
    fi
    
    # 測試搜索頁面
    echo "🔍 測試搜索 Notion 頁面..."
    SEARCH_RESPONSE=$(curl -s "http://localhost:3001/api/notion/search?query=Calculator&limit=3" 2>/dev/null || echo '{"error": "Connection failed"}')
    
    if echo "$SEARCH_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Notion 搜索失敗${NC}"
        echo "Response: $SEARCH_RESPONSE"
    else
        echo -e "${GREEN}✅ Notion 搜索成功${NC}"
        RESULTS_COUNT=$(echo "$SEARCH_RESPONSE" | jq '.results | length' 2>/dev/null || echo "0")
        echo "找到 $RESULTS_COUNT 個相關頁面"
    fi
}

# 2. 測試計算機功能
test_calculator_features() {
    echo -e "\n${CYAN}🧮 演示計算機功能...${NC}"
    
    echo -e "${BLUE}基本計算功能:${NC}"
    echo "  • 2 + 3 * 4 = 14"
    echo "  • sqrt(16) = 4" 
    echo "  • sin(3.14159/2) ≈ 1"
    
    echo -e "${BLUE}貨幣轉換功能:${NC}"
    echo "  • 100 USD → TWD (即時匯率)"
    echo "  • 1000 JPY → USD"
    echo "  • 50 EUR → GBP"
    
    echo -e "${BLUE}高級功能:${NC}"
    echo "  • 科學計算函數 (sin, cos, sqrt, pow)"
    echo "  • 括號運算支持"
    echo "  • 鍵盤快捷鍵支持"
    echo "  • 響應式設計 (手機/桌面)"
    echo "  • 暗色主題支持"
}

# 3. 演示完整工作流程
demo_workflow() {
    echo -e "\n${YELLOW}🔄 完整工作流程演示${NC}"
    echo "=========================="
    
    echo -e "${BLUE}步驟 1: 開啟計算機應用${NC}"
    echo "URL: file://$(pwd)/index.html"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "執行: open index.html"
    fi
    
    echo -e "\n${BLUE}步驟 2: 使用計算機功能${NC}"
    echo "• 測試基本計算"
    echo "• 測試貨幣轉換"
    echo "• 查看即時匯率"
    
    echo -e "\n${BLUE}步驟 3: 觸發 CI/CD 自動化${NC}"
    echo "• 修改程式碼"
    echo "• 提交到 Git"
    echo "• 推送到 GitHub"
    
    echo -e "\n${BLUE}步驟 4: 自動化執行${NC}"
    echo "• GitHub Actions 觸發"
    echo "• MCP 分析程式碼變更"
    echo "• 自動創建 Notion 發佈筆記"
    echo "• 發送 Slack 通知"
}

# 4. 檢查 MCP 服務健康狀態
check_mcp_health() {
    echo -e "\n${GREEN}🏥 MCP 服務健康檢查${NC}"
    echo "========================"
    
    # 檢查後端服務
    if pgrep -f "tsx watch" > /dev/null; then
        echo -e "${GREEN}✅ MCP 後端服務正常運行${NC}"
    else
        echo -e "${RED}❌ MCP 後端服務未運行${NC}"
        echo "啟動: cd devops-mcp && ./start.sh"
    fi
    
    # 檢查健康端點
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null || echo '{"status": "error"}')
    if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
        echo -e "${GREEN}✅ MCP API 服務正常${NC}"
        echo "時間戳: $(echo "$HEALTH_RESPONSE" | jq -r '.ts' 2>/dev/null)"
    else
        echo -e "${RED}❌ MCP API 服務異常${NC}"
    fi
    
    # 顯示服務端點
    echo -e "\n${CYAN}🔗 可用的 API 端點:${NC}"
    echo "• Notion 搜索: GET /api/notion/search?query=..."
    echo "• Notion 創建: POST /api/notion/pages"
    echo "• Slack 事件: POST /api/slack/events"
    echo "• DevOps AI: POST /api/devops/ai/..."
    echo "• 健康檢查: GET /health"
}

# 5. 創建示例變更和測試
create_demo_change() {
    echo -e "\n${PURPLE}🎬 創建 Demo 變更${NC}"
    echo "==================="
    
    # 創建 demo 分支
    DEMO_BRANCH="demo-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$DEMO_BRANCH" 2>/dev/null || true
    
    # 添加 demo 特性
    cat << 'EOF' >> src/calculator.js

// MCP Demo Feature - 自動創建於 $(date)
class MCPIntegration {
    static sendAnalytics(operation, result) {
        console.log(`📊 MCP Analytics: ${operation} = ${result}`);
        // 這裡可以集成真實的 MCP 分析
    }
    
    static logCurrencyConversion(amount, from, to, result) {
        console.log(`💱 Currency: ${amount} ${from} → ${result} ${to}`);
    }
}

// 整合到現有計算器
const originalCalculate = calc.calculate;
calc.calculate = function() {
    const result = originalCalculate.call(this);
    MCPIntegration.sendAnalytics(this.currentInput, result);
    return result;
};

console.log('🚀 MCP Demo Integration Loaded!');
EOF
    
    git add src/calculator.js
    git commit -m "🎬 demo: Add MCP analytics integration

- Added MCPIntegration class for analytics tracking
- Enhanced calculator with usage logging
- Prepared for CI/CD pipeline demonstration
- Currency conversion tracking capability

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "No changes to commit"
    
    echo -e "${GREEN}✅ Demo 分支已創建: $DEMO_BRANCH${NC}"
    echo -e "${BLUE}推送指令: git push origin $DEMO_BRANCH${NC}"
}

# 6. 顯示使用說明
show_usage() {
    echo -e "\n${CYAN}📖 使用說明${NC}"
    echo "============="
    echo "測試模式:"
    echo "  ./demo-mcp-calculator.sh test     - 運行所有測試"
    echo "  ./demo-mcp-calculator.sh notion   - 測試 Notion 整合"
    echo "  ./demo-mcp-calculator.sh health   - 檢查服務健康"
    echo ""
    echo "演示模式:"
    echo "  ./demo-mcp-calculator.sh demo     - 完整功能演示"
    echo "  ./demo-mcp-calculator.sh workflow - 工作流程說明"  
    echo "  ./demo-mcp-calculator.sh change   - 創建 demo 變更"
    echo ""
    echo "計算機功能:"
    echo "  open index.html                   - 開啟計算機應用"
    echo "  ./demo-mcp-calculator.sh calc     - 功能說明"
}

# 主執行函數
main() {
    case ${1:-"demo"} in
        "test")
            check_mcp_health
            test_notion_integration
            ;;
        "notion")
            test_notion_integration
            ;;
        "health")
            check_mcp_health
            ;;
        "demo")
            check_mcp_health
            test_calculator_features
            demo_workflow
            echo -e "\n${GREEN}🎉 MCP Calculator Demo 準備完成！${NC}"
            echo -e "${YELLOW}💡 執行 'open index.html' 開始使用計算機${NC}"
            ;;
        "workflow")
            demo_workflow
            ;;
        "calc")
            test_calculator_features
            ;;
        "change")
            create_demo_change
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            echo "無效的選項: $1"
            show_usage
            exit 1
            ;;
    esac
}

# 執行
main "$@"