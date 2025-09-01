// 🔍 找出可用的 Slack Channels
const https = require('https');

console.log('🔍 查找可用的 Slack Channels');
console.log('============================');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'YOUR_SLACK_BOT_TOKEN_HERE';

async function listChannels(token) {
    console.log('📋 獲取 Slack Channels 列表...');
    
    const options = {
        hostname: 'slack.com',
        port: 443,
        path: '/api/conversations.list?exclude_archived=true&types=public_channel,private_channel',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    resolve({ ok: false, error: 'Invalid JSON' });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({ ok: false, error: error.message });
        });
        
        req.end();
    });
}

async function testSendMessage(token, channelId, channelName) {
    console.log(`\n🧪 測試發送到 ${channelName} (${channelId})...`);
    
    const payload = JSON.stringify({
        channel: channelId,
        text: `🤖 Bot Token 測試訊息 - 發送到 ${channelName}`,
        attachments: [{
            color: "good",
            title: "✅ MCP Calculator Bot 測試",
            text: "這個 channel 可以正常接收 Bot 訊息！",
            footer: "MCP Test"
        }]
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
                    resolve(result);
                } catch (e) {
                    resolve({ ok: false, error: 'Invalid JSON' });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({ ok: false, error: error.message });
        });
        
        req.write(payload);
        req.end();
    });
}

async function main() {
    const channelsResult = await listChannels(SLACK_BOT_TOKEN);
    
    if (!channelsResult.ok) {
        console.log('❌ 無法獲取 channels:', channelsResult.error);
        
        if (channelsResult.error === 'not_authed' || channelsResult.error === 'invalid_auth') {
            console.log('\n💡 Bot Token 問題:');
            console.log('   • Token 可能已過期');
            console.log('   • 需要重新生成 Bot Token');
            console.log('   • 前往 https://api.slack.com/apps → 你的 App → OAuth & Permissions');
        }
        
        return;
    }
    
    const channels = channelsResult.channels || [];
    console.log(`📋 找到 ${channels.length} 個 channels:`);
    console.log('================================');
    
    let workingChannel = null;
    
    for (const channel of channels.slice(0, 5)) { // 只測試前 5 個
        console.log(`📱 ${channel.name} (${channel.is_member ? '✅ 已加入' : '❌ 未加入'}) - ${channel.id}`);
        
        // 只測試 Bot 已加入的 channels
        if (channel.is_member && !workingChannel) {
            const testResult = await testSendMessage(SLACK_BOT_TOKEN, channel.id, channel.name);
            
            if (testResult.ok) {
                console.log(`   ✅ 測試成功！`);
                workingChannel = {
                    id: channel.id,
                    name: channel.name
                };
                break;
            } else {
                console.log(`   ❌ 測試失敗: ${testResult.error}`);
            }
        }
    }
    
    console.log('\n🎯 結果摘要:');
    console.log('==========');
    
    if (workingChannel) {
        console.log(`✅ 找到可用 Channel: #${workingChannel.name}`);
        console.log(`🔗 Channel ID: ${workingChannel.id}`);
        console.log(`📱 請檢查你的 Slack #${workingChannel.name} channel 確認訊息！`);
        
        console.log('\n🚀 下一步:');
        console.log('   1. 確認 Slack 訊息已收到');
        console.log('   2. 我將更新 GitHub Actions 使用這個 channel');
        console.log(`   3. Channel ID 將設為: ${workingChannel.id}`);
        
        // 保存結果到文件
        const channelConfig = {
            channelId: workingChannel.id,
            channelName: workingChannel.name,
            botToken: SLACK_BOT_TOKEN.substring(0, 20) + '...',
            testTime: new Date().toISOString(),
            success: true
        };
        
        require('fs').writeFileSync(
            'slack-channel-config.json', 
            JSON.stringify(channelConfig, null, 2)
        );
        
        console.log('\n💾 配置已保存到 slack-channel-config.json');
        
    } else {
        console.log('❌ 沒有找到可用的 channel');
        console.log('\n💡 可能的解決方案:');
        console.log('   1. 手動邀請 Bot 到一個 channel:');
        console.log('      - 在 Slack 中輸入: /invite @你的bot名稱');
        console.log('   2. 或創建一個新的 channel 並邀請 Bot');
        console.log('   3. 檢查 Bot 的 OAuth 權限設置');
    }
}

main().catch(console.error);