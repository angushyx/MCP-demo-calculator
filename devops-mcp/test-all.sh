#!/bin/bash

echo "🧪 測試所有功能"
echo "==============="
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3001"
ERRORS=0
SUCCESSES=0

# 測試函數
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓${NC} ($response)"
        ((SUCCESSES++))
    else
        echo -e "${RED}✗${NC} ($response)"
        ((ERRORS++))
    fi
}

echo "等待服務啟動..."
sleep 3

echo ""
echo "📡 測試 Backend Health"
echo "----------------------"
test_endpoint "GET" "/health" "" "Health check"

echo ""
echo "🔧 測試 DevOps API"
echo "------------------"
test_endpoint "POST" "/api/devops/ai/summarize" \
    '{"diff":"diff --git a/test.js b/test.js\nindex 123..456\n--- a/test.js\n+++ b/test.js\n@@ -1,3 +1,4 @@\n+// New comment\n function test() {}"}' \
    "Summarize diff"

test_endpoint "POST" "/api/devops/ai/generate-patch" \
    '{"diff":"diff --git a/test.js b/test.js\n--- a/test.js\n+++ b/test.js\n@@ -1,3 +1,4 @@\n function test() {}"}' \
    "Generate patch"

echo ""
echo "📝 測試 Notion API"
echo "------------------"
test_endpoint "GET" "/api/notion/search?query=test" "" "Search pages"

test_endpoint "POST" "/api/notion/pages" \
    '{"title":"Test Page","content":"Test content"}' \
    "Create page"

test_endpoint "GET" "/api/notion/databases/mock-db-123/items" "" "Get database items"

echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有測試通過！${NC} ($SUCCESSES/$((SUCCESSES + ERRORS)))"
else
    echo -e "${YELLOW}⚠️  部分測試失敗${NC} ($SUCCESSES/$((SUCCESSES + ERRORS)) passed)"
fi
echo "================================"
echo ""

# 測試 Frontend
echo "🌐 測試 Frontend"
echo "----------------"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173")
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✓${NC} Frontend is running at http://localhost:5173"
else
    echo -e "${RED}✗${NC} Frontend is not responding (status: $frontend_status)"
fi

echo ""
echo "📊 服務狀態摘要"
echo "---------------"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "💡 提示："
echo "- 如果有測試失敗，檢查 backend.log"
echo "- 確保所有服務都已啟動"
echo "- 等待幾秒後重試"
