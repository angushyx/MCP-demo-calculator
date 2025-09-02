#!/usr/bin/env node
/**
 * 🔍 MCP 成功驗證工具
 * 檢查所有 MCP 服務是否正常運作
 */

const { spawn } = require('child_process');
const { readFileSync, existsSync } = require('fs');

console.log('🔍 MCP 成功驗證工具');
console.log('==================');

// 檢查項目
const checks = {
    'MCP 服務文件': false,
    'Notion MCP 可執行': false,
    'Slack MCP 可執行': false,
    'Claude Reviewer MCP 可執行': false,
    'GitHub Actions 配置': false,
    'MCP 調用腳本': false
};

// 1. 檢查 MCP 服務文件是否存在
function checkMCPFiles() {
    console.log('\n1️⃣ 檢查 MCP 服務文件...');
    
    const files = [
        'devops-mcp/notion-mcp/index.js',
        'devops-mcp/slack-mcp/index.js', 
        'devops-mcp/claude-code-reviewer/index.js',
        'scripts/call-mcp-services.js'
    ];
    
    let allExist = true;
    files.forEach(file => {
        const exists = existsSync(file);
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        if (!exists) allExist = false;
    });
    
    checks['MCP 服務文件'] = allExist;
    return allExist;
}

// 2. 測試單個 MCP 服務
async function testMCPService(name, path, testRequest) {
    console.log(`\n2️⃣ 測試 ${name} MCP 服務...`);
    
    return new Promise((resolve) => {
        const mcpProcess = spawn('node', [path], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                NOTION_API_KEY: 'test-key',
                SLACK_BOT_TOKEN: 'xoxb-test',
                CLAUDE_API_KEY: 'sk-ant-test'
            }
        });
        
        let stdout = '';
        let stderr = '';
        
        mcpProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        mcpProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        // 發送測試請求
        mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');
        mcpProcess.stdin.end();
        
        // 2秒後檢查結果
        setTimeout(() => {
            mcpProcess.kill();
            
            const success = stdout.includes('server is running') || 
                           stdout.includes('MCP running') ||
                           stderr.includes('MCP running');
            
            console.log(`   ${success ? '✅' : '❌'} ${name} 服務狀態: ${success ? '正常' : '失敗'}`);
            if (!success) {
                console.log(`   📝 輸出: ${stdout.slice(-200)}`);
                console.log(`   ⚠️ 錯誤: ${stderr.slice(-200)}`);
            }
            
            resolve(success);
        }, 2000);
    });
}

// 3. 檢查 GitHub Actions 配置
function checkGitHubActions() {
    console.log('\n3️⃣ 檢查 GitHub Actions 配置...');
    
    try {
        const workflow = readFileSync('.github/workflows/mcp-analysis.yml', 'utf8');
        
        const requiredElements = [
            'claude-code-reviewer',
            'call-mcp-services.js',
            'CLAUDE_API_KEY',
            'NOTION_API_KEY', 
            'SLACK_BOT_TOKEN'
        ];
        
        let allPresent = true;
        requiredElements.forEach(element => {
            const present = workflow.includes(element);
            console.log(`   ${present ? '✅' : '❌'} ${element}`);
            if (!present) allPresent = false;
        });
        
        checks['GitHub Actions 配置'] = allPresent;
        return allPresent;
        
    } catch (error) {
        console.log('   ❌ 無法讀取 GitHub Actions 配置');
        return false;
    }
}

// 4. 檢查最近的 GitHub Actions 執行
async function checkRecentGitHubRuns() {
    console.log('\n4️⃣ 檢查最近的 GitHub Actions 執行...');
    
    try {
        // 嘗試使用 gh CLI
        const { execSync } = require('child_process');
        const result = execSync('gh run list --limit 1 --json status,conclusion,createdAt', {
            encoding: 'utf8',
            timeout: 5000
        });
        
        const runs = JSON.parse(result);
        if (runs.length > 0) {
            const latestRun = runs[0];
            const success = latestRun.conclusion === 'success';
            console.log(`   ${success ? '✅' : '❌'} 最新執行: ${latestRun.conclusion}`);
            console.log(`   📅 時間: ${latestRun.createdAt}`);
            return success;
        }
    } catch (error) {
        console.log('   ⚠️ 無法檢查 GitHub Actions (需要 gh CLI)');
        console.log('   💡 請手動檢查: https://github.com/angushyx/MCP-demo-calculator/actions');
    }
    
    return null;
}

// 5. 生成 MCP 成功報告
function generateSuccessReport() {
    console.log('\n🎯 MCP 成功驗證報告');
    console.log('==================');
    
    let successCount = 0;
    let totalChecks = Object.keys(checks).length;
    
    Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        if (passed) successCount++;
    });
    
    const successRate = Math.round((successCount / totalChecks) * 100);
    console.log(`\n📊 成功率: ${successCount}/${totalChecks} (${successRate}%)`);
    
    if (successRate === 100) {
        console.log('\n🎉 恭喜！你的 MCP 整合完全成功！');
        console.log('🚀 所有服務都正常運作');
    } else if (successRate >= 80) {
        console.log('\n✅ 很好！你的 MCP 整合基本成功');
        console.log('🔧 還有少數項目需要調整');
    } else {
        console.log('\n⚠️ MCP 整合需要修復');
        console.log('🔧 請檢查失敗的項目');
    }
    
    return successRate;
}

// 主要驗證流程
async function main() {
    try {
        // 基本檢查
        checkMCPFiles();
        checkGitHubActions();
        
        // 測試 MCP 服務
        const notionTest = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list"
        };
        
        checks['Notion MCP 可執行'] = await testMCPService(
            'Notion', 
            'devops-mcp/notion-mcp/index.js',
            notionTest
        );
        
        checks['Slack MCP 可執行'] = await testMCPService(
            'Slack',
            'devops-mcp/slack-mcp/index.js', 
            notionTest
        );
        
        checks['Claude Reviewer MCP 可執行'] = await testMCPService(
            'Claude Reviewer',
            'devops-mcp/claude-code-reviewer/index.js',
            notionTest
        );
        
        // MCP 調用腳本檢查
        checks['MCP 調用腳本'] = existsSync('scripts/call-mcp-services.js');
        
        // GitHub Actions 檢查
        await checkRecentGitHubRuns();
        
        // 生成報告
        const successRate = generateSuccessReport();
        
        console.log('\n💡 如何確認 MCP 真正成功:');
        console.log('1. 檢查 Slack #all-ags-mcp 是否收到通知');
        console.log('2. 檢查 Notion 是否有新的發佈頁面');
        console.log('3. 查看 GitHub Actions 執行日誌');
        console.log('4. 確認代碼審查結果包含在通知中');
        
        process.exit(successRate === 100 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ 驗證過程出錯:', error.message);
        process.exit(1);
    }
}

main();