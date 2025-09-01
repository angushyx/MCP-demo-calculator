// 🔗 測試永久 Slack Webhook
const https = require('https');
const { URL } = require('url');

console.log('🔗 永久 Slack Webhook 測試工具');
console.log('===============================');

const WEBHOOK_URL = process.argv[2] || process.env.SLACK_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.log('❌ 請提供 Slack Webhook URL');
    console.log('');
    console.log('📱 使用方法:');
    console.log('   node test-permanent-webhook.js "你的webhook_url"');
    console.log('');
    console.log('🔗 Webhook URL 格式範例:');
    console.log('   https://hooks.slack.com/services/T.../B.../新的token');
    console.log('');
    console.log('📋 按照 create-permanent-webhook-guide.md 創建永久 webhook');
    process.exit(1);
}

async function testWebhook(webhookUrl, testNumber, message) {
    console.log(`\n🧪 測試 ${testNumber}: ${message.title}`);
    console.log(`🔗 URL: ${webhookUrl.substring(0, 50)}...`);
    
    try {
        const url = new URL(webhookUrl);
        const data = JSON.stringify(message.payload);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const result = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', chunk => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        body: responseData,
                        success: res.statusCode === 200 && responseData === 'ok'
                    });
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    error: error.message,
                    success: false
                });
            });
            
            req.write(data);
            req.end();
        });
        
        console.log(`📊 狀態: ${result.statusCode} ${result.statusMessage || ''}`);
        console.log(`📝 回應: "${result.body || result.error}"`);
        console.log(`✅ 結果: ${result.success ? '成功' : '失敗'}`);
        
        return result.success;
        
    } catch (error) {
        console.log(`❌ 錯誤: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 開始永久 Webhook 完整測試...\n');
    
    const tests = [
        {
            title: '簡單文字訊息',
            payload: {
                text: "🔗 永久 Webhook 測試 - 簡單訊息"
            }
        },
        {
            title: '豐富格式訊息',
            payload: {
                text: "🎉 永久 Webhook 測試成功！",
                attachments: [{
                    color: "good",
                    title: "✅ MCP Calculator Webhook 測試",
                    fields: [
                        { title: "測試類型", value: "永久 Webhook", short: true },
                        { title: "狀態", value: "🚀 就緒", short: true }
                    ],
                    footer: "MCP Test Suite",
                    ts: Math.floor(Date.now() / 1000)
                }]
            }
        },
        {
            title: 'GitHub Actions 格式預覽',
            payload: {
                text: "🤖 MCP Calculator GitHub Actions 預覽",
                attachments: [{
                    color: "good",
                    title: "📋 自動化發佈筆記",
                    title_link: "https://notion.so/test-page",
                    fields: [
                        { title: "Repository", value: "angushyx/MCP-demo-calculator", short: true },
                        { title: "Author", value: "angushyx", short: true },
                        { title: "Files", value: "2 files", short: true },
                        { title: "Changes", value: "+15/-3 lines", short: true },
                        { title: "Branch", value: "main", short: true },
                        { title: "Run", value: "#25", short: true },
                        { title: "Status", value: "✅ GitHub → Notion → Slack 完整整合", short: false }
                    ],
                    footer: "MCP Calculator Pipeline",
                    footer_icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                    ts: Math.floor(Date.now() / 1000)
                }]
            }
        }
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < tests.length; i++) {
        const success = await testWebhook(WEBHOOK_URL, i + 1, tests[i]);
        if (success) successCount++;
        
        // 在測試間稍作等待
        if (i < tests.length - 1) {
            console.log('   ⏳ 等待 2 秒...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n🎯 測試結果摘要:');
    console.log('================');
    console.log(`成功: ${successCount}/${tests.length}`);
    console.log(`Webhook 狀態: ${successCount === tests.length ? '✅ 完全正常' : '❌ 有問題'}`);
    
    if (successCount === tests.length) {
        console.log('\n🎉 恭喜！永久 Webhook 設置成功！');
        console.log('📱 請檢查你的 Slack channel 確認所有測試訊息');
        console.log('');
        console.log('🚀 下一步:');
        console.log('   1. 複製這個 Webhook URL');
        console.log('   2. 我將更新 GitHub Actions workflow');
        console.log('   3. 測試完整的 MCP 自動化流程');
        console.log('');
        console.log(`🔗 你的永久 Webhook URL: ${WEBHOOK_URL}`);
    } else {
        console.log('\n❌ 測試失敗，可能的問題:');
        console.log('   • Webhook URL 無效或已過期');
        console.log('   • Slack App 權限問題');
        console.log('   • 網路連接問題');
        console.log('');
        console.log('💡 請按照 create-permanent-webhook-guide.md 重新創建');
    }
    
    return successCount === tests.length;
}

runTests().catch(console.error);