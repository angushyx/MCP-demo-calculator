#!/bin/bash
# 測試修復後的 jq 命令
set -e

echo "🔧 測試 GitHub Actions jq 命令修復..."

# 創建測試 diff 文件
cat > /tmp/test_changes.diff << 'EOF'
diff --git a/src/calculator.js b/src/calculator.js
index abc123..def456 100644
--- a/src/calculator.js
+++ b/src/calculator.js
@@ -1,5 +1,10 @@
 class Calculator {
+    // 新增貨幣轉換功能
     constructor() {
+        this.currencyRates = {};
         this.display = document.getElementById("display");
     }
+
+    convertCurrency(amount, from, to) {
+        return amount * this.currencyRates[to] / this.currencyRates[from];
+    }
 }
EOF

# 測試修復後的 jq 命令
echo "📋 測試分析請求 JSON 生成..."
cat /tmp/test_changes.diff | jq -Rs \
  --arg repo "angushyx/MCP-demo-calculator" \
  --arg branch "test-branch" \
  --arg commit "abc123def456" \
  --arg pr_number "" \
  --arg author "angushyx" \
  --argjson changed_files 1 \
  --argjson insertions 5 \
  --argjson deletions 0 \
  --arg event_type "push" \
  '{
    "diff": .,
    "metadata": {
      "repository": $repo,
      "branch": $branch,
      "commit": $commit,
      "pr_number": $pr_number,
      "author": $author,
      "changed_files": $changed_files,
      "insertions": $insertions,
      "deletions": $deletions,
      "event_type": $event_type
    }
  }' > /tmp/test_analysis_request.json

if [ $? -eq 0 ]; then
    echo "✅ jq 命令執行成功"
    echo "📄 生成的 JSON 預覽:"
    head -10 /tmp/test_analysis_request.json
    echo "..."
    echo "JSON 大小: $(wc -c < /tmp/test_analysis_request.json) bytes"
else
    echo "❌ jq 命令執行失敗"
    exit 1
fi

# 測試文檔生成請求
echo ""
echo "📝 測試文檔生成請求 JSON..."
ANALYSIS_JSON='{"summary": "Added currency conversion functionality", "recommendations": ["Test the new feature", "Update documentation"]}'

cat /tmp/test_changes.diff | jq -Rs \
  --argjson analysis "$ANALYSIS_JSON" \
  --arg version "main-v123" \
  --arg repo "angushyx/MCP-demo-calculator" \
  --arg commit "abc123def456" \
  '{
    "diff": .,
    "analysis_result": $analysis,
    "version": $version,
    "metadata": {
      "repository": $repo,
      "commit": $commit
    }
  }' > /tmp/test_doc_request.json

if [ $? -eq 0 ]; then
    echo "✅ 文檔生成 jq 命令執行成功"
    echo "📄 生成的 JSON 預覽:"
    jq '.analysis_result' /tmp/test_doc_request.json
else
    echo "❌ 文檔生成 jq 命令執行失敗"
    exit 1
fi

# 清理
rm -f /tmp/test_changes.diff /tmp/test_analysis_request.json /tmp/test_doc_request.json

echo ""
echo "🎉 所有 jq 命令測試通過！GitHub Actions workflow 應該可以正常運行。"