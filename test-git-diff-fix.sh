#!/bin/bash
# 測試 Git diff 修復 - 模擬 GitHub Actions 環境

echo "🔧 測試 Git Diff 修復..."

# 模擬新分支推送情況
echo "📋 測試情況 1: 新分支推送 (before SHA = 0000000...)"
BEFORE_SHA="0000000000000000000000000000000000000000"

if [ "$BEFORE_SHA" = "0000000000000000000000000000000000000000" ] || [ -z "$BEFORE_SHA" ]; then
    BASE_SHA="origin/main"
    echo "✅ 檢測到新分支，BASE_SHA 設為: $BASE_SHA"
else
    BASE_SHA="$BEFORE_SHA"
    echo "✅ 使用 BEFORE_SHA: $BASE_SHA"
fi

# 測試 git diff 命令
echo "🔄 測試 git diff 命令..."

if [ "$BASE_SHA" = "origin/main" ]; then
    echo "執行: git diff origin/main...HEAD --unified=3"
    if git diff origin/main...HEAD --unified=3 > /tmp/test_diff.txt 2>/dev/null; then
        echo "✅ git diff origin/main...HEAD 成功"
        DIFF_SIZE=$(wc -c < /tmp/test_diff.txt)
        echo "Diff 大小: $DIFF_SIZE bytes"
    else
        echo "⚠️  git diff origin/main...HEAD 失敗，嘗試備用方案"
        if git diff HEAD~1 --unified=3 > /tmp/test_diff.txt 2>/dev/null; then
            echo "✅ git diff HEAD~1 成功 (備用方案)"
            DIFF_SIZE=$(wc -c < /tmp/test_diff.txt)
            echo "Diff 大小: $DIFF_SIZE bytes"
        else
            echo "❌ 所有 git diff 命令都失敗"
            exit 1
        fi
    fi
fi

# 測試變更統計
echo "📊 測試變更統計..."

if [ "$BASE_SHA" = "origin/main" ]; then
    CHANGED_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null | wc -l || git diff --name-only HEAD~1 2>/dev/null | wc -l || echo "0")
    INSERTIONS=$(git diff --shortstat origin/main...HEAD 2>/dev/null | grep -oE '[0-9]+ insertions?' | grep -oE '[0-9]+' || git diff --shortstat HEAD~1 2>/dev/null | grep -oE '[0-9]+ insertions?' | grep -oE '[0-9]+' || echo "0")
    DELETIONS=$(git diff --shortstat origin/main...HEAD 2>/dev/null | grep -oE '[0-9]+ deletions?' | grep -oE '[0-9]+' || git diff --shortstat HEAD~1 2>/dev/null | grep -oE '[0-9]+ deletions?' | grep -oE '[0-9]+' || echo "0")
fi

echo "✅ 統計結果:"
echo "  • 變更檔案: $CHANGED_FILES"
echo "  • 新增行數: $INSERTIONS"  
echo "  • 刪除行數: $DELETIONS"

# 清理
rm -f /tmp/test_diff.txt

echo ""
echo "🎉 Git diff 修復測試完成！"
echo "📝 這個修復應該能解決新分支推送時的 'Invalid symmetric difference expression' 錯誤"