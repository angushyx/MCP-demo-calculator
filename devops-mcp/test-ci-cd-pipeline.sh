#!/bin/bash

# 🚀 MCP CI/CD Pipeline 測試腳本
# 這個腳本會測試完整的 CI/CD 功能

set -e

echo "🤖 MCP CI/CD Pipeline 測試開始"
echo "================================="

# 配置
API_BASE_URL="http://localhost:3001/api/ci-cd"
API_TOKEN="mcp_secure_token_2024_devops"
TEMP_DIR="/tmp/mcp-ci-cd-test"

# 創建臨時目錄
mkdir -p "$TEMP_DIR"

# 顏色函數
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 測試 API 連通性
test_api_connectivity() {
    log_info "測試 API 連通性..."
    
    if curl -s -f http://localhost:3001/health > /dev/null; then
        log_success "✅ 後端服務運行正常"
    else
        log_error "❌ 後端服務不可用，請確保 Docker 服務運行中"
        exit 1
    fi
    
    # 測試 CI/CD 統計端點
    STATS_RESULT=$(curl -s -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        "$API_BASE_URL/stats")
    
    if echo "$STATS_RESULT" | jq -e '.success_rate' > /dev/null 2>&1; then
        log_success "✅ CI/CD API 端點可用"
        echo "   - 成功率: $(echo "$STATS_RESULT" | jq -r '.success_rate')"
        echo "   - 平均處理時間: $(echo "$STATS_RESULT" | jq -r '.avg_processing_time')"
    else
        log_error "❌ CI/CD API 端點不可用"
        exit 1
    fi
}

# 測試代碼分析功能
test_code_analysis() {
    log_info "測試代碼分析功能..."
    
    # 準備測試數據
    cat > "$TEMP_DIR/analysis_payload.json" << 'EOF'
{
  "diff": "diff --git a/src/auth/login.ts b/src/auth/login.ts\nindex abc123..def456 100644\n--- a/src/auth/login.ts\n+++ b/src/auth/login.ts\n@@ -1,5 +1,12 @@\n import bcrypt from 'bcrypt';\n+import rateLimit from 'express-rate-limit';\n \n+const loginLimiter = rateLimit({\n+  windowMs: 15 * 60 * 1000,\n+  max: 5\n+});\n+\n export async function login(email: string, password: string) {\n+  // Rate limiting applied\n   const hashedPassword = await bcrypt.hash(password, 12);\n   return { success: true };\n }",
  "metadata": {
    "repository": "mcp-test/security-demo",
    "branch": "feature/rate-limiting",
    "commit": "test-commit-123",
    "author": "test-user",
    "changed_files": 1,
    "insertions": 7,
    "deletions": 0,
    "event_type": "push"
  }
}
EOF

    # 執行分析
    ANALYSIS_RESULT=$(curl -s -X POST "$API_BASE_URL/analyze" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_DIR/analysis_payload.json")
    
    if echo "$ANALYSIS_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        log_success "✅ 代碼分析功能正常"
        
        # 提取關鍵信息
        RISK_LEVEL=$(echo "$ANALYSIS_RESULT" | jq -r '.analysis.risk_assessment.level')
        RECOMMENDATIONS_COUNT=$(echo "$ANALYSIS_RESULT" | jq -r '.analysis.recommendations | length')
        
        echo "   - 風險等級: $RISK_LEVEL"
        echo "   - 建議數量: $RECOMMENDATIONS_COUNT"
        echo "   - 分析完成時間: $(echo "$ANALYSIS_RESULT" | jq -r '.analysis.timestamp')"
        
        # 檢查是否包含中英雙語內容
        if echo "$ANALYSIS_RESULT" | grep -q "Intelligent Code Analysis" && echo "$ANALYSIS_RESULT" | grep -q "智能代碼分析"; then
            log_success "   ✅ 雙語分析報告正常"
        else
            log_warning "   ⚠️ 雙語分析可能有問題"
        fi
    else
        log_error "❌ 代碼分析功能失敗"
        echo "$ANALYSIS_RESULT" | jq
        exit 1
    fi
}

# 測試文檔生成功能
test_doc_generation() {
    log_info "測試文檔生成功能..."
    
    # 準備文檔生成測試數據
    cat > "$TEMP_DIR/docs_payload.json" << 'EOF'
{
  "diff": "diff --git a/src/api/users.ts b/src/api/users.ts\nindex 123..456 100644\n--- a/src/api/users.ts\n+++ b/src/api/users.ts\n@@ -1,3 +1,15 @@\n+/**\n+ * User management API endpoints\n+ * @module UserAPI\n+ */\n+\n import { Router } from 'express';\n \n+/**\n+ * Create a new user account\n+ * @param userData User registration data\n+ * @returns Created user object\n+ */\n export async function createUser(userData: any) {\n+  // Validate input data\n   return { id: 1, ...userData };\n }",
  "version": "v2.2.0-test",
  "metadata": {
    "repository": "mcp-test/api-service",
    "commit": "doc-test-456"
  }
}
EOF

    # 執行文檔生成
    DOC_RESULT=$(curl -s -X POST "$API_BASE_URL/generate-docs" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_DIR/docs_payload.json")
    
    if echo "$DOC_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        log_success "✅ 文檔生成功能正常"
        
        VERSION=$(echo "$DOC_RESULT" | jq -r '.version')
        GENERATED_AT=$(echo "$DOC_RESULT" | jq -r '.generated_at')
        
        echo "   - 版本: $VERSION"
        echo "   - 生成時間: $GENERATED_AT"
        
        # 檢查文檔補丁是否包含 diff 格式
        if echo "$DOC_RESULT" | jq -r '.documentation_patch' | grep -q "diff --git"; then
            log_success "   ✅ 文檔補丁格式正確"
        else
            log_warning "   ⚠️ 文檔補丁格式可能有問題"
        fi
    else
        log_error "❌ 文檔生成功能失敗"
        echo "$DOC_RESULT" | jq
        exit 1
    fi
}

# 測試 Notion 頁面創建
test_notion_integration() {
    log_info "測試 Notion 頁面創建..."
    
    # 準備 Notion 測試數據
    cat > "$TEMP_DIR/notion_payload.json" << EOF
{
  "version": "v2.3.0-notion-test-$(date +%s)",
  "release_date": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
  "repository": "mcp-test/notion-integration",
  "commit": "notion-test-789",
  "author": "CI/CD Test Runner",
  "branch": "main",
  "analysis": {
    "summary": "## 🧪 測試發布\n- 新增 Notion 整合功能\n- 改進 CI/CD 流程\n- 添加自動化測試",
    "recommendations": ["✅ 執行完整測試套件", "📝 更新部署文檔", "🚀 準備生產部署"]
  },
  "documentation": "diff --git a/README.md b/README.md\n+### CI/CD Integration\n+- Automated analysis and documentation\n+- Notion page generation\n+- Slack notifications",
  "stats": {
    "changed_files": 5,
    "insertions": 28,
    "deletions": 3
  }
}
EOF

    # 執行 Notion 頁面創建
    NOTION_RESULT=$(curl -s -X POST "$API_BASE_URL/create-release-page" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_DIR/notion_payload.json")
    
    if echo "$NOTION_RESULT" | jq -e '.success' > /dev/null 2>&1; then
        log_success "✅ Notion 頁面創建成功"
        
        PAGE_URL=$(echo "$NOTION_RESULT" | jq -r '.page_url')
        VERSION=$(echo "$NOTION_RESULT" | jq -r '.version')
        PAGE_ID=$(echo "$NOTION_RESULT" | jq -r '.notion_result.id')
        
        echo "   - 版本: $VERSION"
        echo "   - 頁面 ID: $PAGE_ID"
        echo "   - 頁面 URL: $PAGE_URL"
        
        log_info "🌐 你可以在瀏覽器中打開這個連結查看創建的頁面"
    else
        log_error "❌ Notion 頁面創建失敗"
        echo "$NOTION_RESULT" | jq
        exit 1
    fi
}

# 測試完整的 CI/CD 流程模擬
test_full_pipeline() {
    log_info "模擬完整 CI/CD 流程..."
    
    echo ""
    echo "🔄 模擬 GitHub Push Event"
    echo "========================"
    
    # 模擬一個完整的 push event
    REPO_NAME="mcp-demo/full-pipeline-test"
    BRANCH_NAME="feature/complete-test"
    COMMIT_SHA="full-test-$(date +%s)"
    
    log_info "Repository: $REPO_NAME"
    log_info "Branch: $BRANCH_NAME"
    log_info "Commit: $COMMIT_SHA"
    
    echo ""
    echo "📊 Step 1: 代碼分析..."
    
    # 第一步：代碼分析
    cat > "$TEMP_DIR/full_analysis.json" << EOF
{
  "diff": "diff --git a/src/components/Dashboard.tsx b/src/components/Dashboard.tsx\nindex abc123..def456 100644\n--- a/src/components/Dashboard.tsx\n+++ b/src/components/Dashboard.tsx\n@@ -1,10 +1,25 @@\n import React, { useState, useEffect } from 'react';\n+import { useAuth } from '../hooks/useAuth';\n+import { fetchDashboardData } from '../api/dashboard';\n \n export const Dashboard: React.FC = () => {\n   const [data, setData] = useState(null);\n+  const { user, isAuthenticated } = useAuth();\n+  const [loading, setLoading] = useState(false);\n+  const [error, setError] = useState(null);\n \n   useEffect(() => {\n-    // TODO: Fetch dashboard data\n+    if (isAuthenticated) {\n+      fetchDashboardData()\n+        .then(setData)\n+        .catch(setError)\n+        .finally(() => setLoading(false));\n+    }\n   }, []);\n \n+  if (!isAuthenticated) {\n+    return <div>Please log in to view dashboard</div>;\n+  }\n+\n   return (\n     <div className=\"dashboard\">\n       <h1>Dashboard</h1>\n+      {loading && <div>Loading...</div>}\n+      {error && <div>Error: {error.message}</div>}\n+      {data && <DashboardContent data={data} />}\n     </div>\n   );\n };",
  "metadata": {
    "repository": "$REPO_NAME",
    "branch": "$BRANCH_NAME",
    "commit": "$COMMIT_SHA",
    "author": "Full Pipeline Tester",
    "changed_files": 1,
    "insertions": 18,
    "deletions": 1,
    "event_type": "push"
  }
}
EOF

    FULL_ANALYSIS=$(curl -s -X POST "$API_BASE_URL/analyze" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_DIR/full_analysis.json")
    
    if echo "$FULL_ANALYSIS" | jq -e '.success' > /dev/null; then
        log_success "✅ 分析完成"
        RISK_LEVEL=$(echo "$FULL_ANALYSIS" | jq -r '.analysis.risk_assessment.level')
        echo "   - 風險等級: $RISK_LEVEL"
    else
        log_error "❌ 分析失敗"
        return 1
    fi
    
    echo ""
    echo "📝 Step 2: 文檔生成..."
    
    # 第二步：文檔生成
    cat > "$TEMP_DIR/full_docs.json" << EOF
{
  "diff": "$(echo "$FULL_ANALYSIS" | jq -r '.analysis.metadata' | head -c 1000)",
  "version": "v3.0.0-full-test",
  "metadata": {
    "repository": "$REPO_NAME",
    "commit": "$COMMIT_SHA"
  }
}
EOF

    # 簡化文檔請求
    DOC_SIMPLE='{"diff":"diff --git a/README.md b/README.md\n+Dashboard improvements","version":"v3.0.0-full-test","metadata":{"repository":"'$REPO_NAME'","commit":"'$COMMIT_SHA'"}}'
    
    FULL_DOCS=$(curl -s -X POST "$API_BASE_URL/generate-docs" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$DOC_SIMPLE")
    
    if echo "$FULL_DOCS" | jq -e '.success' > /dev/null; then
        log_success "✅ 文檔生成完成"
    else
        log_error "❌ 文檔生成失敗"
        return 1
    fi
    
    echo ""
    echo "📋 Step 3: Notion 頁面創建..."
    
    # 第三步：Notion 頁面創建
    cat > "$TEMP_DIR/full_notion.json" << EOF
{
  "version": "v3.0.0-full-test-$(date +%s)",
  "release_date": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
  "repository": "$REPO_NAME",
  "commit": "$COMMIT_SHA",
  "author": "Full Pipeline Tester",
  "branch": "$BRANCH_NAME",
  "analysis": $(echo "$FULL_ANALYSIS" | jq '.analysis'),
  "documentation": $(echo "$FULL_DOCS" | jq -r '.documentation_patch' | jq -R .),
  "stats": {
    "changed_files": 1,
    "insertions": 18,
    "deletions": 1
  }
}
EOF

    FULL_NOTION=$(curl -s -X POST "$API_BASE_URL/create-release-page" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d @"$TEMP_DIR/full_notion.json")
    
    if echo "$FULL_NOTION" | jq -e '.success' > /dev/null; then
        log_success "✅ Notion 頁面創建完成"
        FULL_PAGE_URL=$(echo "$FULL_NOTION" | jq -r '.page_url')
        echo "   - 頁面 URL: $FULL_PAGE_URL"
    else
        log_error "❌ Notion 頁面創建失敗"
        return 1
    fi
    
    echo ""
    log_success "🎉 完整 CI/CD 流程測試成功！"
    echo ""
    echo "📋 測試結果摘要:"
    echo "   - Repository: $REPO_NAME"
    echo "   - Branch: $BRANCH_NAME"
    echo "   - Commit: $COMMIT_SHA"
    echo "   - 風險等級: $RISK_LEVEL"
    echo "   - Notion 頁面: $FULL_PAGE_URL"
}

# 清理函數
cleanup() {
    log_info "清理臨時檔案..."
    rm -rf "$TEMP_DIR"
    log_success "✅ 清理完成"
}

# 主測試函數
main() {
    echo ""
    log_info "開始 MCP CI/CD Pipeline 完整測試"
    echo ""
    
    # 設置清理陷阱
    trap cleanup EXIT
    
    # 執行所有測試
    test_api_connectivity
    echo ""
    
    test_code_analysis
    echo ""
    
    test_doc_generation
    echo ""
    
    test_notion_integration
    echo ""
    
    test_full_pipeline
    echo ""
    
    log_success "🎉 所有測試完成！"
    echo ""
    echo "🚀 你的 MCP CI/CD Pipeline 已準備就緒！"
    echo ""
    echo "下一步:"
    echo "1. 設置 GitHub Secrets (參考 setup-ci-cd.md)"
    echo "2. 推送代碼到 GitHub 觸發 Actions"
    echo "3. 查看 Notion 中的自動生成文檔"
    echo "4. 在 Slack 中接收發布通知"
    echo ""
}

# 執行主函數
main "$@"