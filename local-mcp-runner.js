#!/usr/bin/env node
/**
 * 🏠 本機 MCP 執行器 - Local MCP Runner
 * 
 * 在你的本機執行完整的 MCP 流程，而不是在 GitHub Actions 中執行
 * 
 * 優點:
 * - 完全控制執行環境
 * - 可以直接使用你的 API keys (不需要 GitHub Secrets)
 * - 更好的除錯和日誌
 * - 不受 GitHub Actions 限制
 * - 可以立即看到結果
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

console.log('🏠 本機 MCP 執行器啟動中...');
console.log('================================');

// 配置
const config = {
    // 從環境變數或 .env 文件讀取
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    
    // GitHub 監控設定
    GITHUB_REPO: 'angushyx/MCP-demo-calculator',
    CHECK_INTERVAL: 30000, // 30秒檢查一次
    
    // MCP 服務路徑
    MCP_SERVICES: {
        claude: './devops-mcp/claude-code-reviewer/index.js',
        notion: './devops-mcp/notion-mcp/index.js',
        slack: './devops-mcp/slack-mcp/index.js'
    }
};

// 檢查必要的 API keys
function checkConfiguration() {
    console.log('🔧 檢查配置...');
    
    const required = ['CLAUDE_API_KEY', 'NOTION_API_KEY', 'SLACK_BOT_TOKEN'];
    const missing = [];
    
    required.forEach(key => {
        if (!config[key]) {
            missing.push(key);
        } else {
            console.log(`   ✅ ${key}: ${config[key].substring(0, 10)}...`);
        }
    });
    
    if (missing.length > 0) {
        console.error(`❌ 缺少必要的 API keys: ${missing.join(', ')}`);
        console.log('💡 請設置環境變數或創建 .env 文件');
        return false;
    }
    
    return true;
}

// 獲取最新的 commit 資訊
function getLatestCommitInfo() {
    try {
        const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const commitMessage = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
        const author = execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf8' }).trim();
        const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' }).split('\n').filter(f => f.trim());
        const diff = execSync('git show HEAD --format="" --no-merges', { encoding: 'utf8', maxBuffer: 1024 * 1024 });
        
        const stats = execSync('git diff --shortstat HEAD~1 HEAD', { encoding: 'utf8' }).trim();
        const statsMatch = stats.match(/(\d+) files? changed(?:, (\d+) insertions?)?(?:, (\d+) deletions?)?/);
        
        return {
            hash: commitHash,
            message: commitMessage,
            author,
            changedFiles: changedFiles.length,
            insertions: statsMatch ? (statsMatch[2] || '0') : '0',
            deletions: statsMatch ? (statsMatch[3] || '0') : '0',
            diff: diff.slice(0, 8000), // 限制大小
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ 獲取 commit 資訊失敗:', error.message);
        return null;
    }
}

// 執行 MCP 服務
async function runMCPService(serviceName, serviceFile, request) {
    console.log(`🤖 執行 ${serviceName} MCP 服務...`);
    
    return new Promise((resolve) => {
        const mcpProcess = spawn('node', [serviceFile], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env: {
                ...process.env,
                CLAUDE_API_KEY: config.CLAUDE_API_KEY,
                ANTHROPIC_API_KEY: config.CLAUDE_API_KEY,
                NOTION_API_KEY: config.NOTION_API_KEY,
                SLACK_BOT_TOKEN: config.SLACK_BOT_TOKEN
            }
        });
        
        let stdout = '';
        let stderr = '';
        
        mcpProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            console.log(`   📤 ${serviceName}:`, output.trim());
        });
        
        mcpProcess.stderr.on('data', (data) => {
            const error = data.toString();
            stderr += error;
            console.log(`   ⚠️ ${serviceName} stderr:`, error.trim());
        });
        
        mcpProcess.on('close', (code) => {
            console.log(`   ✅ ${serviceName} 完成 (exit code: ${code})`);
            
            try {
                // 解析 MCP 響應
                const lines = stdout.split('\n').filter(line => {
                    try {
                        JSON.parse(line);
                        return true;
                    } catch {
                        return false;
                    }
                });
                
                if (lines.length > 0) {
                    const response = JSON.parse(lines[lines.length - 1]);
                    if (response.result) {
                        resolve({
                            success: true,
                            data: response.result,
                            service: serviceName
                        });
                        return;
                    }
                }
                
                resolve({
                    success: code === 0,
                    data: `${serviceName} 執行完成`,
                    service: serviceName,
                    logs: { stdout, stderr }
                });
            } catch (error) {
                console.log(`   ⚠️ ${serviceName} 響應解析失敗:`, error.message);
                resolve({
                    success: code === 0,
                    data: `${serviceName} 執行完成但響應解析失敗`,
                    service: serviceName
                });
            }
        });
        
        // 發送 MCP 請求
        mcpProcess.stdin.write(JSON.stringify(request) + '\n');
        mcpProcess.stdin.end();
        
        // 15秒後超時
        setTimeout(() => {
            mcpProcess.kill();
            resolve({
                success: false,
                data: `${serviceName} 執行超時`,
                service: serviceName
            });
        }, 15000);
    });
}

// 執行完整的 MCP 流程
async function runFullMCPPipeline(commitInfo) {
    console.log('\n🚀 開始完整的本機 MCP 流程...');
    console.log('=====================================');
    
    const results = {};
    
    // 1. Claude Code Review
    console.log('\n1️⃣ Claude Code Review');
    const claudeRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "CodeReviewer:reviewDiff",
            arguments: {
                diff: commitInfo.diff,
                context: `本機 MCP 自動代碼審查 - ${commitInfo.message}`,
                focus: "all"
            }
        }
    };
    
    results.claude = await runMCPService('Claude Reviewer', config.MCP_SERVICES.claude, claudeRequest);
    const codeReview = results.claude.data?.content?.[0]?.text || results.claude.data || '代碼審查完成';
    
    // 2. Notion Page Creation  
    console.log('\n2️⃣ Notion Page Creation');
    const notionRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
            name: "Notion:createPage",
            arguments: {
                title: `🏠 本機 MCP 自動化 - ${new Date().toLocaleDateString()}`,
                content: `# 🏠 本機 MCP 自動化執行結果

## 📊 Commit 資訊
- **作者**: ${commitInfo.author}
- **訊息**: ${commitInfo.message}
- **時間**: ${commitInfo.timestamp}
- **變更**: ${commitInfo.changedFiles} 個文件, +${commitInfo.insertions}/-${commitInfo.deletions} 行

## 🤖 Claude 代碼審查結果
${codeReview}

## ✅ 執行狀態
- ✅ 本機 MCP 執行成功
- ✅ 完整控制和即時回饋
- ✅ 直接使用本地 API keys`
            }
        }
    };
    
    results.notion = await runMCPService('Notion', config.MCP_SERVICES.notion, notionRequest);
    const notionPageUrl = results.notion.data?.url || 'https://www.notion.so/MCP-Local-Execution';
    
    // 3. Slack Notification
    console.log('\n3️⃣ Slack Notification');
    const slackRequest = {
        jsonrpc: "2.0", 
        id: 3,
        method: "tools/call",
        params: {
            name: "Slack:postMessage",
            arguments: {
                channel: "#all-ags-mcp",
                text: "🏠 本機 MCP 自動化執行成功！",
                attachments: [{
                    color: "good",
                    title: "📋 本機 MCP 自動化報告",
                    title_link: notionPageUrl,
                    fields: [
                        { title: "執行環境", value: "🏠 本機執行", short: true },
                        { title: "作者", value: commitInfo.author, short: true },
                        { title: "變更", value: `${commitInfo.changedFiles} 個文件`, short: true },
                        { title: "行數", value: `+${commitInfo.insertions}/-${commitInfo.deletions}`, short: true },
                        { title: "Claude 審查", value: results.claude.success ? "✅ 完成" : "❌ 失敗", short: true },
                        { title: "Notion 頁面", value: results.notion.success ? "✅ 已創建" : "❌ 失敗", short: true },
                        { title: "狀態", value: "🏠 本機 MCP 完全控制 ✅", short: false }
                    ],
                    footer: "本機 MCP 執行器",
                    ts: Math.floor(Date.now() / 1000)
                }]
            }
        }
    };
    
    results.slack = await runMCPService('Slack', config.MCP_SERVICES.slack, slackRequest);
    
    // 執行結果摘要
    console.log('\n🎯 本機 MCP 執行結果摘要');
    console.log('========================');
    Object.entries(results).forEach(([service, result]) => {
        console.log(`${result.success ? '✅' : '❌'} ${service}: ${result.success ? '成功' : '失敗'}`);
    });
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n📊 總體成功率: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
    
    if (successCount === totalCount) {
        console.log('🎉 所有 MCP 服務執行成功！');
        console.log('📱 請查看 Slack 和 Notion 確認結果');
    }
    
    return results;
}

// 主要執行函數
async function main() {
    // 檢查配置
    if (!checkConfiguration()) {
        process.exit(1);
    }
    
    console.log('🔍 獲取最新 commit 資訊...');
    const commitInfo = getLatestCommitInfo();
    
    if (!commitInfo) {
        console.error('❌ 無法獲取 commit 資訊');
        process.exit(1);
    }
    
    console.log('📊 Commit 資訊:');
    console.log(`   Hash: ${commitInfo.hash.substring(0, 8)}`);
    console.log(`   訊息: ${commitInfo.message}`);
    console.log(`   作者: ${commitInfo.author}`);
    console.log(`   變更: ${commitInfo.changedFiles} 個文件, +${commitInfo.insertions}/-${commitInfo.deletions} 行`);
    
    // 執行 MCP 流程
    const results = await runFullMCPPipeline(commitInfo);
    
    console.log('\n✨ 本機 MCP 執行完成！');
    process.exit(0);
}

// 如果直接執行此腳本
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ 執行失敗:', error);
        process.exit(1);
    });
}

module.exports = { runFullMCPPipeline, getLatestCommitInfo };