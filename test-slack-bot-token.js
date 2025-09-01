// 🤖 使用 Slack Bot Token 發送訊息測試
const https = require('https');

console.log('🤖 Slack Bot Token 測試工具');
console.log('==========================');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'YOUR_SLACK_BOT_TOKEN_HERE';
const CHANNEL = '#general'; // 可以改成你想要的 channel

async function sendSlackMessage(token, channel, message) {
    console.log('🔗 使用 Bot Token 發送訊息...');
    console.log('📱 Channel:', channel);
    console.log('🤖 Bot Token:', token.substring(0, 20) + '...');
    
    const payload = JSON.stringify({
        channel: channel,
        text: message.text,
        attachments: message.attachments || [],
        username: 'MCP Calculator Bot',
        icon_emoji: ':robot_face:'
    });
    
    const options = {
        hostname: 'slack.com',
        port: 443,
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        success: result.ok,
                        data: result,
                        error: result.error
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        success: false,
                        error: 'Invalid JSON response',
                        rawData: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });
        
        req.write(payload);
        req.end();
    });
}

async function testBotToken() {
    const testMessage = {
        text: "🎉 MCP Calculator Bot Token 測試成功！",
        attachments: [{
            color: "good",
            title: "✅ Slack Bot 整合測試",
            fields: [
                {
                    title: "Method",
                    value: "Bot Token (不是 Webhook)",
                    short: true
                },
                {
                    title: "Advantage", 
                    value: "🔒 永不過期，更穩定",
                    short: true
                },
                {
                    title: "Repository",
                    value: "angushyx/MCP-demo-calculator",
                    short: false
                },
                {
                    title: "Status",
                    value: "🚀 準備整合到 GitHub Actions",
                    short: false
                }
            ],
            footer: "MCP Calculator Pipeline",
            footer_icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            ts: Math.floor(Date.now() / 1000)
        }]
    };
    
    console.log('📤 發送測試訊息...');
    
    const result = await sendSlackMessage(SLACK_BOT_TOKEN, CHANNEL, testMessage);
    
    console.log('\n📊 測試結果:');
    console.log('============');
    console.log(`HTTP 狀態: ${result.status || 'N/A'}`);
    console.log(`Slack API 成功: ${result.success ? '✅ true' : '❌ false'}`);
    
    if (result.success) {
        console.log(`📱 Channel: ${result.data.channel}`);
        console.log(`⏰ Timestamp: ${result.data.ts}`);
        console.log(`📝 Message: ${result.data.message?.text?.substring(0, 50)}...`);
        
        console.log('\n🎉 Bot Token 測試成功！');
        console.log('💡 優點:');
        console.log('   • 不會像 Webhook 一樣過期');
        console.log('   • 更穩定的整合');
        console.log('   • 支援更豐富的訊息格式');
        console.log('   • 可以發送到多個 channel');
        
    } else {
        console.log(`❌ 錯誤: ${result.error}`);
        console.log(`📄 詳細: ${JSON.stringify(result.data, null, 2)}`);
        
        console.log('\n🔧 可能的問題:');
        if (result.error === 'not_authed' || result.error === 'invalid_auth') {
            console.log('   • Bot Token 無效或過期');
        } else if (result.error === 'channel_not_found') {
            console.log('   • Channel 不存在或 Bot 沒有權限');
        } else if (result.error === 'missing_scope') {
            console.log('   • Bot 缺少 chat:write 權限');
            console.log('   • 需要在 Slack App 設置中添加 OAuth Scope');
        } else {
            console.log(`   • 未知錯誤: ${result.error}`);
        }
    }
    
    return result.success;
}

// 測試不同的 channels
async function testMultipleChannels() {
    const channels = ['#general', 'general', '@你的用戶名']; // 可以測試不同格式
    
    console.log('\n🧪 測試多個 Channel...');
    
    for (const channel of channels) {
        console.log(`\n🔄 測試 Channel: ${channel}`);
        const result = await sendSlackMessage(SLACK_BOT_TOKEN, channel, {
            text: `📱 Channel 測試: ${channel}`,
            attachments: [{
                color: "warning",
                text: "測試 Bot 是否可以發送到此 channel",
                footer: "Channel Test"
            }]
        });
        
        if (result.success) {
            console.log(`✅ ${channel} - 成功`);
        } else {
            console.log(`❌ ${channel} - 失敗: ${result.error}`);
        }
    }
}

async function main() {
    const success = await testBotToken();
    
    if (success) {
        console.log('\n🚀 準備更新 GitHub Actions...');
        console.log('   下一步將把 Bot Token 整合到 workflow 中');
    } else {
        console.log('\n💡 需要先修復 Bot Token 設置');
        // await testMultipleChannels(); // 可以取消註解來測試不同 channels
    }
}

main().catch(console.error);