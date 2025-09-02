# 🤖 Claude Code Reviewer MCP 服務設置指南

## 🎯 功能介紹

Claude Code Reviewer 是一個使用 Claude 3.5 Sonnet 的智能代碼審查 MCP 服務，提供：

- **📊 Git Diff 審查**: 分析代碼變更差異
- **🔍 單文件審查**: 深度分析特定文件
- **💡 改進建議**: 提供具體的代碼優化建議
- **🛡️ 安全檢查**: 識別潛在的安全問題
- **⚡ 性能分析**: 發現性能瓶頸

## 🔧 設置步驟

### 1. GitHub Secrets 設置

前往: https://github.com/angushyx/MCP-demo-calculator/settings/secrets/actions

添加以下 Secret:
```
名稱: CLAUDE_API_KEY 或 ANTHROPIC_API_KEY
值: sk-ant-your-anthropic-api-key
```

### 2. 獲取 Claude API Key

1. 前往 https://console.anthropic.com/
2. 創建 API Key
3. 複製以 `sk-ant-` 開頭的 key

### 3. MCP 服務能力

#### 支持的工具:
- `CodeReviewer:reviewDiff` - 審查 Git diff
- `CodeReviewer:reviewFile` - 審查單個文件
- `CodeReviewer:suggestImprovements` - 建議改進

#### 審查焦點:
- `all` - 全面審查 (預設)
- `security` - 專注安全性
- `performance` - 專注性能
- `bugs` - 專注錯誤檢測
- `style` - 專注代碼風格

## 🔄 工作流程

```
GitHub Push
    ↓
GitHub Actions 觸發
    ↓
獲取 Git Diff
    ↓
Claude Code Reviewer MCP ← 使用真正的 MCP 協議
    ↓
Notion MCP (包含審查結果)
    ↓
Slack MCP (通知審查完成)
```

## 🧪 測試模式

如果沒有設置 `CLAUDE_API_KEY`，服務會運行在 Mock 模式，提供範例審查結果。

---
✅ 設置完成後，每次代碼推送都會自動進行 Claude 代碼審查！