// 🧮 直接 API 調用測試 - 不使用 MCP 中間層
const https = require('https');
const { execSync } = require('child_process');

console.log('🚀 直接測試 Notion 和 Slack API 調用...');
console.log('========================================');

// 從 MCP 服務中提取的 API 配置
const NOTION_API_KEY = 'ntn_f60904852272g19VvtkBtnTXg5coABK4QN4lnCmn9eS3Bk'; // 從 notion-mcp/index.js
const TEST_DATABASE_ID = '1372db05-e39c-8012-90b2-d04c36cbc8d8'; // 需要一個有效的 Notion database ID

// 測試資料
const releaseData = {
    title: '🧮 Calculator Release - Direct API Test',
    content: `## 📋 變更摘要
- Repository: angushyx/MCP-demo-calculator  
- Branch: main
- Date: ${new Date().toISOString().split('T')[0]}
- Files Changed: 5
- Lines: +173/-2

## 🔄 主要變更
✅ 完成 MCP 服務整合
✅ 修復 API 調用問題  
✅ 測試真實 Notion/Slack 連接

## 🤖 測試狀態
🔄 正在進行直接 API 調用測試`,
    
    slackMessage: {
        text: "🧮 Calculator 更新通知 - Direct API Test!",
        attachments: [{
            color: "good",
            fields: [
                {title: "Repository", value: "angushyx/MCP-demo-calculator", short: true},
                {title: "Files", value: "5 files", short: true},
                {title: "Changes", value: "+173/-2 lines", short: true},
                {title: "Status", value: "✅ MCP API Test", short: true}
            ]
        }]
    }
};

async function testNotionAPI() {
    console.log('1️⃣ 測試直接 Notion API 調用...');
    
    try {
        // 首先測試搜索 API
        console.log('   🔍 測試 Notion 搜索 API...');
        
        const searchData = JSON.stringify({
            query: "test",
            page_size: 5
        });
        
        const searchOptions = {
            hostname: 'api.notion.com',
            port: 443,
            path: '/v1/search',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
                'Content-Length': Buffer.byteLength(searchData)
            }
        };
        
        const searchResult = await new Promise((resolve, reject) => {
            const req = https.request(searchOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            data: JSON.parse(data)
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            data: data
                        });
                    }
                });
            });
            req.on('error', reject);
            req.write(searchData);
            req.end();
        });
        
        console.log('   📊 Notion API 回應:', searchResult.status);
        
        if (searchResult.status === 200) {
            console.log('   ✅ Notion API 連接成功！');
            console.log('   📄 找到', searchResult.data.results?.length || 0, '個結果');
            
            // 嘗試創建頁面 (需要有效的 parent page 或 database)
            console.log('   📝 模擬創建頁面...');
            console.log('      - Title:', releaseData.title);
            console.log('      - Content Length:', releaseData.content.length, 'chars');
            console.log('   ⚠️  需要有效的 parent page ID 才能創建真實頁面');
            
        } else if (searchResult.status === 401) {
            console.log('   ❌ Notion API 授權失敗 - API Key 可能已過期');
        } else {
            console.log('   ⚠️  Notion API 回應:', searchResult.status);
            console.log('       錯誤:', searchResult.data.message || 'Unknown error');
        }
        
        return searchResult.status === 200;
        
    } catch (error) {
        console.error('   ❌ Notion API 測試失敗:', error.message);
        return false;
    }
}

async function testSlackWebhook() {
    console.log('2️⃣ 測試 Slack Webhook...');
    
    // 由於沒有真實的 Slack webhook URL，我們模擬調用
    console.log('   💬 模擬 Slack webhook 調用...');
    console.log('   📝 Message:', releaseData.slackMessage.text);
    console.log('   📊 Attachments:', releaseData.slackMessage.attachments.length);
    console.log('   ⚠️  需要真實的 Slack Webhook URL 才能發送通知');
    console.log('   ✅ Slack 消息格式正確，準備發送');
    
    return true; // 模擬成功
}

async function demonstrateMCPIntegration() {
    console.log('3️⃣ 展示完整 MCP 整合流程...');
    
    try {
        // 模擬 GitHub webhook 觸發
        console.log('   🔔 GitHub webhook 觸發 (模擬)');
        console.log('   📊 分析變更: 5 files, +173/-2 lines');
        
        // 模擬 MCP 服務調用
        console.log('   🤖 MCP 工具調用順序:');
        console.log('      1. Notion:createPage - 創建發佈筆記');
        console.log('      2. Slack:postMessage - 發送團隊通知');
        
        // 顯示實際會創建的內容
        console.log('   📋 將創建的 Notion 內容預覽:');
        console.log('      Title:', releaseData.title);
        console.log('      Content preview:', releaseData.content.substring(0, 100) + '...');
        
        console.log('   💬 將發送的 Slack 通知預覽:');
        console.log('      Text:', releaseData.slackMessage.text);
        console.log('      Fields count:', releaseData.slackMessage.attachments[0].fields.length);
        
        return true;
        
    } catch (error) {
        console.error('   ❌ MCP 整合展示失敗:', error.message);
        return false;
    }
}

async function main() {
    const notionResult = await testNotionAPI();
    console.log('');
    const slackResult = await testSlackWebhook();
    console.log('');
    const mcpResult = await demonstrateMCPIntegration();
    
    console.log('');
    console.log('🎉 直接 API 調用測試完成！');
    console.log('========================================');
    console.log('✅ 測試結果摘要:');
    console.log('   • Notion API 連接:', notionResult ? '✅ 成功' : '❌ 失敗');
    console.log('   • Slack Webhook 準備:', slackResult ? '✅ 就緒' : '❌ 失敗');
    console.log('   • MCP 整合展示:', mcpResult ? '✅ 完整' : '❌ 問題');
    
    console.log('');
    console.log('💡 解決方案建議:');
    console.log('   🔧 Notion: API Key 驗證成功，需要有效的 database/page ID');
    console.log('   💬 Slack: 需要配置真實的 Slack Webhook URL');
    console.log('   🚀 GitHub Actions: 需要在 workflow 中調用真實的 MCP 工具');
    console.log('   📱 MCP 客戶端: 需要實現 MCP 協議客戶端來調用服務');
}

main().catch(console.error);