#!/bin/bash

echo "🔧 修復 TypeScript 錯誤..."
echo "=========================="

cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp

# 1. 安裝 @types/node 到所有需要的地方
echo "📦 安裝 @types/node..."

cd devops-mcp
npm install --save-dev @types/node
cd ..

cd slack-mcp
npm install --save-dev @types/node
cd ..

cd notion-mcp
npm install --save-dev @types/node
cd ..

cd backend
npm install --save-dev @types/node
cd ..

echo "✅ 依賴安裝完成"
echo ""
echo "現在重新編譯..."

# 2. 重新編譯
cd devops-mcp
npx tsc
cd ..

cd slack-mcp
npx tsc
cd ..

cd notion-mcp
npx tsc
cd ..

echo "✅ 修復完成！"
