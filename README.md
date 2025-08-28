# 智能工作助理 App - MCP 整合專案

這個專案整合了 Notion、Canva、Google Drive、Gmail、GitHub、Airbnb 搜尋、檔案系統等多個服務，建立一個統一的工作管理平台。

## 快速開始

```bash
# 1. 進入專案目錄
cd /Users/angushyx/Desktop/mcp-multi-service

# 2. 安裝依賴
cd backend && npm install
cd ../frontend && npm install

# 3. 設定環境變數
cd ../backend
cp .env.example .env
# 編輯 .env 填入你的 API keys

# 4. 啟動服務
# Terminal 1 - 後端
cd backend && npm run dev

# Terminal 2 - 前端  
cd frontend && npm run dev

# 5. 開啟瀏覽器訪問 http://localhost:5173
```

## 專案結構

```
mcp-multi-service/
├── backend/              # Express + MCP 後端
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── mcp-client.ts
│       └── routes/
├── frontend/            # React 前端應用
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       └── services/
└── docker-compose.yml
```

## 功能特點

1. **統一搜尋**: 跨服務搜尋功能，一次搜尋所有整合的服務
2. **即時同步**: 所有變更即時反映在各個服務中
3. **AI 生成**: 整合 Canva AI 生成設計功能
4. **批次操作**: 支援批次處理多個檔案或項目
5. **安全認證**: OAuth 2.0 安全認證機制

## 支援的服務

- 📝 **Notion**: 搜尋和創建頁面、管理資料庫
- 🎨 **Canva**: 設計管理、AI 生成、匯出功能
- 📁 **Google Drive**: 檔案搜尋和管理
- 📧 **Gmail**: 讀取和發送郵件
- 🐙 **GitHub**: 儲存庫、Issue 和程式碼管理
- 🏠 **Airbnb**: 搜尋房源
- 📂 **檔案系統**: 本地檔案管理

## 環境需求

- Node.js 18+
- npm 或 yarn
- 各服務的 API 金鑰

## 授權

MIT License
