#!/bin/bash

# 將專案從 mcp-multi-service 移動到 Desktop/devops-mcp

SOURCE="/Users/angushyx/Desktop/mcp-multi-service/devops-mcp"
TARGET="/Users/angushyx/Desktop/devops-mcp"

echo "準備移動專案..."
echo "從: $SOURCE"
echo "到: $TARGET"

# 檢查目標目錄是否已存在
if [ -d "$TARGET" ]; then
    echo "警告: 目標目錄已存在。是否要覆蓋? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "操作已取消"
        exit 1
    fi
    rm -rf "$TARGET"
fi

# 移動專案
mv "$SOURCE" "$TARGET"

echo "✅ 專案已成功移動到 $TARGET"
echo ""
echo "接下來的步驟："
echo "1. cd $TARGET"
echo "2. chmod +x start.sh"
echo "3. ./start.sh install  # 安裝所有依賴"
echo "4. ./start.sh dev      # 啟動開發環境"
