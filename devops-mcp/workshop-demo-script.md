# 🎬 MCP Workshop Demo 操作腳本

## 🎯 Demo 準備（5分鐘前）

### 1. 確保服務運行
```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
docker-compose ps  # 確認服務運行
curl http://localhost:3001/health  # 健康檢查
```

### 2. 準備瀏覽器頁面
打開以下頁面並排列好窗口：
- **Notion 工作區**: https://www.notion.so/25316b056deb80889948cd2a79d92e1e
- **終端窗口**: 準備執行 Demo 命令
- **簡報**: 架構圖和流程說明

## 🎬 Live Demo 腳本（15分鐘）

### 開場介紹（2分鐘）
```
"今天我要展示如何用 MCP 打造智能 CI/CD Pipeline。
這個系統可以自動分析代碼變更、生成文檔、並通知團隊。
讓我們看看 AI 如何革命化 DevOps 工作流程！"
```

### Step 1: 架構展示（3分鐘）
展示系統架構圖並說明：
```
GitHub Push → GitHub Actions → MCP Analysis → Notion → Slack
     ↓              ↓              ↓              ↓       ↓
   觸發事件      自動化流程      AI 智能分析    文檔管理  團隊通知
```

**執行命令**:
```bash
echo "🔍 系統架構展示"
echo "MCP 多服務協作:"
echo "  - devops-mcp: AI 代碼分析"  
echo "  - notion-mcp: 文檔管理"
echo "  - slack-mcp: 團隊通知"
```

### Step 2: 模擬代碼推送（5分鐘）

**情境設定**:
```
"假設我們的電商團隊剛剛完成了 Stripe 支付整合，
讓我們看看 AI 如何分析這個重要的代碼變更。"
```

**執行 Demo 命令**:
```bash
# 創建測試數據
cat > /tmp/workshop-demo.json << 'EOF'
{
  "diff": "diff --git a/src/payment/StripeGateway.tsx b/src/payment/StripeGateway.tsx\nindex abc123..def456 100644\n--- a/src/payment/StripeGateway.tsx\n+++ b/src/payment/StripeGateway.tsx\n@@ -1,8 +1,30 @@\n import React, { useState } from 'react';\n+import { loadStripe } from '@stripe/stripe-js';\n+import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';\n+import { validatePayment, encryptData } from '../utils/security';\n \n export const StripeGateway: React.FC = () => {\n   const [processing, setProcessing] = useState(false);\n+  const [error, setError] = useState('');\n+  const stripe = useStripe();\n+  const elements = useElements();\n \n+  const handlePayment = async (amount: number) => {\n+    if (!stripe || !elements) return;\n+    \n+    setProcessing(true);\n+    try {\n+      const { error, paymentIntent } = await stripe.confirmCardPayment(\n+        clientSecret, {\n+          payment_method: {\n+            card: elements.getElement(CardElement)!,\n+            billing_details: { name: customerName }\n+          }\n+        }\n+      );\n+      \n+      if (error) throw error;\n+      console.log('Payment success:', paymentIntent);\n+    } catch (err: any) {\n+      setError(err.message);\n+    } finally {\n+      setProcessing(false);\n+    }\n+  };\n+\n   return (\n-    <div>Simple Payment</div>\n+    <div className=\"stripe-gateway\">\n+      <CardElement />\n+      <button onClick={() => handlePayment(1000)} disabled={processing}>\n+        {processing ? 'Processing...' : 'Pay $10.00'}\n+      </button>\n+      {error && <div className=\"error\">{error}</div>}\n+    </div>\n   );\n };",
  "metadata": {
    "repository": "workshop-demo/ecommerce-app",
    "branch": "feature/stripe-payment",
    "commit": "workshop-demo-123",
    "author": "demo-presenter", 
    "changed_files": 1,
    "insertions": 25,
    "deletions": 1,
    "event_type": "push"
  }
}
EOF

# 執行 AI 分析
echo "🤖 執行 AI 代碼分析..."
curl -s -X POST http://localhost:3001/api/ci-cd/analyze \
  -H "Authorization: Bearer mcp_secure_token_2024_devops" \
  -H "Content-Type: application/json" \
  -d @/tmp/workshop-demo.json | jq
```

**展示重點**:
- 指出 AI 如何識別 Stripe 整合
- 強調安全風險評估
- 解釋雙語分析報告

### Step 3: 文檔生成展示（2分鐘）

```bash
# 生成文檔補丁
echo "📝 自動生成文檔補丁..."
cat > /tmp/docs-demo.json << 'EOF'
{
  "diff": "diff --git a/src/payment/StripeGateway.tsx b/src/payment/StripeGateway.tsx\n+import { loadStripe } from '@stripe/stripe-js';",
  "version": "v3.1.0-workshop-demo",
  "metadata": {
    "repository": "workshop-demo/ecommerce-app",
    "commit": "workshop-demo-123"
  }
}
EOF

curl -s -X POST http://localhost:3001/api/ci-cd/generate-docs \
  -H "Authorization: Bearer mcp_secure_token_2024_devops" \
  -H "Content-Type: application/json" \
  -d @/tmp/docs-demo.json | jq -r '.documentation_patch'
```

### Step 4: Notion 頁面創建（3分鐘）

```bash
# 創建 Notion 發布頁面
echo "📋 創建 Notion 發布頁面..."
TIMESTAMP=$(date +%s)
cat > /tmp/notion-demo.json << EOF
{
  "version": "v3.1.0-workshop-live-$TIMESTAMP",
  "release_date": "$(date -u '+%Y-%m-%d %H:%M:%S UTC')",
  "repository": "workshop-demo/ecommerce-app", 
  "commit": "workshop-demo-123",
  "author": "demo-presenter",
  "branch": "feature/stripe-payment",
  "analysis": {
    "summary": "## 🚀 Stripe 支付整合\n- 新增安全支付網關\n- 整合 React Stripe Elements\n- 實作錯誤處理機制\n- 添加支付狀態管理",
    "recommendations": [
      "✅ 執行支付流程測試",
      "🔒 驗證 PCI DSS 合規性", 
      "📝 更新支付 API 文檔",
      "🚀 分階段發布到生產環境"
    ]
  },
  "documentation": "Generated payment gateway documentation with security best practices",
  "stats": {
    "changed_files": 1,
    "insertions": 25, 
    "deletions": 1
  }
}
EOF

NOTION_RESULT=$(curl -s -X POST http://localhost:3001/api/ci-cd/create-release-page \
  -H "Authorization: Bearer mcp_secure_token_2024_devops" \
  -H "Content-Type: application/json" \
  -d @/tmp/notion-demo.json)

echo "$NOTION_RESULT" | jq
PAGE_URL=$(echo "$NOTION_RESULT" | jq -r '.page_url')
echo ""
echo "🌐 Notion 頁面已創建: $PAGE_URL"
```

**切換到 Notion 展示新創建的頁面**

## 🎯 Demo 收尾（2分鐘）

### 強調核心價值
```
"剛才大家看到的整個流程：
✅ 從代碼推送到 AI 分析 - 3秒完成
✅ 自動生成文檔和發布頁面 - 無需人工干預  
✅ 智能風險評估和建議 - 提升代碼品質
✅ 團隊協作無縫整合 - 統一工作流程

這就是 MCP 帶來的革命性改變！"
```

### 展示實際價值
- **效率提升**: 30分鐘 → 13秒
- **品質改善**: AI 驅動的智能分析
- **團隊協作**: 統一的工作流程

## 🛠️ 應急方案

### 如果 API 調用失敗：
```bash
# 檢查服務狀態
curl http://localhost:3001/health

# 重啟服務（如需要）
docker-compose restart

# 使用預錄的結果
echo "展示預先準備的分析結果..."
```

### 如果網路問題：
- 切換到本地展示模式
- 使用已創建的 Notion 頁面
- 展示架構圖和代碼示例

## 📱 Demo 設備檢查清單

### 必須準備：
- [ ] 雙螢幕設置（一個演示，一個操作）
- [ ] 穩定的網路連接
- [ ] 終端字體大小調整（便於觀眾閱讀）
- [ ] Notion 頁面預先載入
- [ ] Docker 服務正常運行

### 建議準備：
- [ ] 備用網路連線
- [ ] 螢幕錄影（以防萬一）
- [ ] 簡報遙控器
- [ ] 計時器

## 🎤 演講技巧提醒

1. **節奏控制**: 每個步驟後稍作停頓，讓觀眾消化
2. **互動引導**: "大家可以看到..." "注意這裡..."
3. **價值強調**: 不斷提到效率提升和智能化
4. **故障準備**: 如果出錯，保持冷靜並切換到備用方案

---

**🎉 你已經準備好進行一場精彩的 MCP Workshop Demo！**