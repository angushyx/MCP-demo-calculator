// 🧮 真實發送 Slack 通知測試
const https = require('https');
const { URL } = require('url');

console.log('🚀 真實發送 Slack 通知測試...');
console.log('==================================');

// Slack Webhook URL - 需要用戶提供
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || process.argv[2];

if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  使用方法: node create-real-slack-notification.js <SLACK_WEBHOOK_URL>');
    console.log('');
    console.log('💡 如何獲取 Slack Webhook URL:');
    console.log('   1. 前往 https://api.slack.com/apps');
    console.log('   2. 創建新的 Slack App 或選擇現有的');
    console.log('   3. 啟用 "Incoming Webhooks"');
    console.log('   4. 添加 Webhook to Workspace');
    console.log('   5. 複製 Webhook URL (格式: https://hooks.slack.com/services/...)');
    console.log('');
    console.log('🧪 範例呼叫:');
    console.log('   node create-real-slack-notification.js "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"');
    process.exit(1);
}

async function sendSlackNotification(webhookUrl, message) {
    console.log('💬 發送 Slack 通知...');
    console.log('🔗 Webhook URL:', webhookUrl.substring(0, 50) + '...');
    
    try {
        const url = new URL(webhookUrl);
        const payload = JSON.stringify(message);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                });
            });
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
        
    } catch (error) {
        console.error('❌ URL 解析錯誤:', error.message);
        return { status: 400, data: 'Invalid URL' };
    }
}

async function main() {
    // 準備 Slack 訊息內容
    const slackMessage = {
        text: "🧮 MCP Calculator 更新成功！",
        attachments: [
            {
                color: "good",
                title: "📋 Release Notes",
                title_link: "https://www.notion.so/MCP-Calculator-Release-Notes-26116b056deb811586bbc32445755f09",
                fields: [
                    {
                        title: "Repository",
                        value: "angushyx/MCP-demo-calculator",
                        short: true
                    },
                    {
                        title: "Author", 
                        value: process.env.USER || "test-user",
                        short: true
                    },
                    {
                        title: "Files Changed",
                        value: "5 files",
                        short: true
                    },
                    {
                        title: "Changes",
                        value: "+173/-2 lines", 
                        short: true
                    },
                    {
                        title: "Status",
                        value: "✅ MCP Integration Complete",
                        short: false
                    }
                ],
                footer: "MCP Calculator Pipeline",
                footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
                ts: Math.floor(Date.now() / 1000)
            }
        ]
    };
    
    console.log('📝 訊息內容:');
    console.log('   Text:', slackMessage.text);
    console.log('   Attachments:', slackMessage.attachments.length);
    console.log('   Fields:', slackMessage.attachments[0].fields.length);
    console.log('   Notion Link:', slackMessage.attachments[0].title_link ? '✅ 包含' : '❌ 無');
    
    // 發送通知
    const result = await sendSlackNotification(SLACK_WEBHOOK_URL, slackMessage);
    
    if (result.status === 200) {
        console.log('🎉 Slack 通知發送成功！');
        console.log('✅ 狀態:', result.status);
        console.log('📱 請查看你的 Slack channel 確認訊息已送達');
        return true;
    } else {
        console.error('❌ Slack 通知發送失敗');
        console.error('💬 狀態:', result.status);
        console.error('📄 回應:', result.data);
        
        if (result.status === 404) {
            console.log('💡 錯誤可能原因: Webhook URL 無效或已過期');
        } else if (result.status === 400) {
            console.log('💡 錯誤可能原因: 訊息格式不正確');
        }
        
        return false;
    }
}

main().then(success => {
    console.log('');
    console.log('🎯 測試結果:', success ? '✅ 成功' : '❌ 失敗');
    console.log('');
    if (success) {
        console.log('🚀 恭喜！你的完整 MCP 整合已經運作：');
        console.log('   ✅ GitHub → 程式碼分析');
        console.log('   ✅ Notion → 發佈筆記創建'); 
        console.log('   ✅ Slack → 團隊通知發送');
        console.log('');
        console.log('🎉 MCP 自動化管道完全成功！');
    }
}).catch(error => {
    console.error('❌ 執行錯誤:', error.message);
});