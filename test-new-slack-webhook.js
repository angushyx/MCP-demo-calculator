// 🔧 測試新的 Slack Webhook URL
const https = require('https');
const { URL } = require('url');

console.log('🔧 Slack Webhook 測試工具');
console.log('========================');

// 從命令行參數或環境變數獲取新的 Webhook URL
const WEBHOOK_URL = process.argv[2] || process.env.SLACK_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.log('❌ 請提供 Slack Webhook URL');
    console.log('');
    console.log('📱 使用方法:');
    console.log('   node test-new-slack-webhook.js "你的新webhook_url"');
    console.log('');
    console.log('🔗 或設置環境變數:');
    console.log('   export SLACK_WEBHOOK_URL="你的新webhook_url"');
    console.log('   node test-new-slack-webhook.js');
    console.log('');
    console.log('💡 Webhook URL 格式範例:');
    console.log('   https://hooks.slack.com/services/T.../B.../新的token');
    process.exit(1);
}

async function testSlackWebhook(webhookUrl) {
    console.log('🔗 測試 URL:', webhookUrl.substring(0, 50) + '...');
    console.log('');

    const testMessage = {
        text: "🎉 新的 Slack Webhook 測試成功！",
        attachments: [{
            color: "good",
            title: "✅ MCP Calculator 整合測試",
            fields: [
                {
                    title: "Repository",
                    value: "angushyx/MCP-demo-calculator",
                    short: true
                },
                {
                    title: "Status", 
                    value: "🚀 Webhook 重新設置成功",
                    short: true
                },
                {
                    title: "下一步",
                    value: "準備更新 GitHub Actions workflow",
                    short: false
                }
            ],
            footer: "MCP Test Suite",
            footer_icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            ts: Math.floor(Date.now() / 1000)
        }]
    };

    try {
        const url = new URL(webhookUrl);
        const payload = JSON.stringify(testMessage);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        console.log('📤 發送測試訊息...');
        
        const result = await new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({
                    status: res.statusCode,
                    message: res.statusMessage,
                    body: data,
                    success: res.statusCode === 200
                }));
            });
            
            req.on('error', (error) => resolve({
                success: false,
                error: error.message
            }));
            
            req.write(payload);
            req.end();
        });
        
        console.log('📊 測試結果:');
        console.log('============');
        console.log(`狀態: ${result.status} ${result.message || ''}`);
        console.log(`回應: "${result.body || result.error}"`);
        console.log(`結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
        
        if (result.success) {
            console.log('');
            console.log('🎉 恭喜！Slack Webhook 設置成功！');
            console.log('📱 請檢查你的 Slack channel 確認訊息已收到');
            console.log('');
            console.log('🚀 下一步:');
            console.log('   1. 複製這個 Webhook URL');
            console.log('   2. 我會更新 GitHub Actions workflow');
            console.log('   3. 測試完整的 GitHub → Notion → Slack 流程');
            console.log('');
            console.log('🔗 你的新 Webhook URL:');
            console.log(`   ${webhookUrl}`);
            
        } else {
            console.log('');
            console.log('❌ 測試失敗，可能的原因:');
            if (result.body === 'no_service') {
                console.log('   • Webhook 仍然無效或已被刪除');
            } else if (result.status === 404) {
                console.log('   • URL 路徑錯誤或 Webhook 不存在');
            } else if (result.status === 403) {
                console.log('   • 權限被拒絕，App 可能被停用');
            } else {
                console.log(`   • 未知錯誤: ${result.body || result.error}`);
            }
            console.log('');
            console.log('💡 建議重新檢查 Slack App 設置');
        }
        
        return result.success;
        
    } catch (error) {
        console.log('❌ 測試錯誤:', error.message);
        return false;
    }
}

testSlackWebhook(WEBHOOK_URL).catch(console.error);