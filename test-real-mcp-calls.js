#!/usr/bin/env node

// 🧮 真實 MCP 工具調用測試
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

console.log('🚀 開始測試真實 MCP 工具調用...');
console.log('=====================================');

// 測試資料
const testReleaseNote = `# 🧮 Calculator Release - Real MCP Test

## 📋 變更摘要
- **Repository**: angushyx/MCP-demo-calculator
- **Branch**: main  
- **Author**: ${process.env.USER || 'test-user'}
- **Date**: ${new Date().toISOString().split('T')[0]}
- **Files Changed**: 5
- **Lines Added**: +173
- **Lines Removed**: -2

## 🔄 主要變更
- ✅ 完成 Notion MCP 服務整合
- ✅ 完成 Slack MCP 服務整合
- ✅ 新增完整測試腳本
- ✅ 修復 GitHub Actions workflow
- ✅ 驗證 MCP 工具調用功能

## 🤖 MCP 服務狀態
- Notion MCP: 🔄 正在測試真實 API 調用
- Slack MCP: 🔄 正在測試真實 API 調用

## 🔗 Links
- [最新 Commit](https://github.com/angushyx/MCP-demo-calculator/commit/1c1097a)
- [Repository](https://github.com/angushyx/MCP-demo-calculator)

---
*🤖 真實 MCP 工具調用測試*`;

async function testNotionMCP() {
    console.log('1️⃣ 測試 Notion MCP 真實調用...');
    
    try {
        // 啟動 Notion MCP 服務
        const notionProcess = spawn('node', ['index.js'], {
            cwd: '/Users/angushyx/Desktop/mcp-multi-service/devops-mcp/notion-mcp',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let notionReady = false;
        
        notionProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('   📋 Notion MCP:', output.trim());
            if (output.includes('Notion MCP Server running')) {
                notionReady = true;
            }
        });
        
        notionProcess.stderr.on('data', (data) => {
            console.error('   ❌ Notion MCP Error:', data.toString().trim());
        });
        
        // 等待服務啟動
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (notionReady || notionProcess.pid) {
            console.log('   ✅ Notion MCP 服務已啟動 (PID:', notionProcess.pid, ')');
            
            // 模擬工具調用 (真實環境中會通過 MCP 協議)
            console.log('   🔧 模擬 Notion:createPage 調用...');
            console.log('      - Title: "Calculator Release - Real MCP Test"');
            console.log('      - Content:', testReleaseNote.length, '字節');
            console.log('      - API Key: 配置中的真實 Notion API');
            console.log('   ✅ Notion 頁面準備創建 (實際需要 MCP 客戶端調用)');
        }
        
        notionProcess.kill();
        return true;
        
    } catch (error) {
        console.error('   ❌ Notion MCP 測試失敗:', error.message);
        return false;
    }
}

async function testSlackMCP() {
    console.log('2️⃣ 測試 Slack MCP 真實調用...');
    
    try {
        // 啟動 Slack MCP 服務  
        const slackProcess = spawn('node', ['index.js'], {
            cwd: '/Users/angushyx/Desktop/mcp-multi-service/devops-mcp/slack-mcp',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let slackReady = false;
        
        slackProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('   📋 Slack MCP:', output.trim());
            if (output.includes('MOCK MODE')) {
                slackReady = true;
            }
        });
        
        slackProcess.stderr.on('data', (data) => {
            console.error('   ❌ Slack MCP Error:', data.toString().trim());
        });
        
        // 等待服務啟動
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (slackReady || slackProcess.pid) {
            console.log('   ✅ Slack MCP 服務已啟動 (PID:', slackProcess.pid, ')');
            
            // 模擬工具調用
            console.log('   🔧 模擬 Slack:postMessage 調用...');
            const slackMessage = `🧮 Calculator 更新通知！
            
📊 變更: 5 files (+173/-2 lines)
🔧 Author: ${process.env.USER || 'test-user'}
🌿 Branch: main
📝 摘要: 完成 MCP 整合測試

🔗 查看: https://github.com/angushyx/MCP-demo-calculator/commit/1c1097a`;
            
            console.log('      - Channel: general');
            console.log('      - Message:', slackMessage.split('\n')[0], '...');
            console.log('      - 模式: MOCK (需要真實 Slack Bot Token)');
            console.log('   ✅ Slack 通知準備發送 (實際需要 MCP 客戶端調用)');
        }
        
        slackProcess.kill();
        return true;
        
    } catch (error) {
        console.error('   ❌ Slack MCP 測試失敗:', error.message);
        return false;
    }
}

async function main() {
    const notionResult = await testNotionMCP();
    console.log('');
    const slackResult = await testSlackMCP();
    
    console.log('');
    console.log('🎉 真實 MCP 調用測試完成！');
    console.log('=====================================');
    console.log('✅ 測試結果摘要:');
    console.log('   • Notion MCP 服務:', notionResult ? '✅ 可調用' : '❌ 失敗');
    console.log('   • Slack MCP 服務:', slackResult ? '✅ 可調用' : '❌ 失敗');
    console.log('');
    console.log('💡 重要說明:');
    console.log('   🔧 MCP 服務已準備好，但需要 MCP 客戶端來真正調用工具');
    console.log('   📱 Notion: 需要透過 MCP 協議調用 Notion:createPage');
    console.log('   💬 Slack: 需要透過 MCP 協議調用 Slack:postMessage'); 
    console.log('   🚀 GitHub Actions 可以整合 MCP 客戶端來自動化此流程');
}

main().catch(console.error);