// 🔧 Slack 問題診斷工具
const https = require('https');

console.log('🔧 Slack 問題完整診斷');
console.log('=====================');

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const SLACK_CHANNEL = 'C09BMBKK6DN'; // all-ags-mpc

console.log(`🤖 Bot Token: ${SLACK_BOT_TOKEN.substring(0, 20)}...`);
console.log(`📱 Target Channel: ${SLACK_CHANNEL}`);

// 1. 測試 Bot 是否有效
async function testBotAuth() {
    console.log('\n1️⃣ 測試 Bot 認證...');
    
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'slack.com',
            path: '/api/auth.test',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   狀態: ${result.ok ? '✅ 有效' : '❌ 無效'}`);
                    if (result.ok) {
                        console.log(`   Bot 名稱: ${result.user}`);
                        console.log(`   Team: ${result.team}`);
                        console.log(`   User ID: ${result.user_id}`);
                    } else {
                        console.log(`   錯誤: ${result.error}`);
                    }
                    resolve(result.ok);
                } catch (e) {
                    console.log('   ❌ 解析錯誤');
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

// 2. 測試 Channel 資訊
async function testChannelInfo() {
    console.log('\n2️⃣ 測試 Channel 資訊...');
    
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'slack.com',
            path: `/api/conversations.info?channel=${SLACK_CHANNEL}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   狀態: ${result.ok ? '✅ 可存取' : '❌ 不可存取'}`);
                    if (result.ok) {
                        console.log(`   Channel 名稱: #${result.channel.name}`);
                        console.log(`   Bot 是成員: ${result.channel.is_member ? '✅ 是' : '❌ 否'}`);
                        console.log(`   Channel 類型: ${result.channel.is_private ? '私人' : '公開'}`);
                    } else {
                        console.log(`   錯誤: ${result.error}`);
                        if (result.error === 'channel_not_found') {
                            console.log('   💡 Bot 可能沒有被邀請到這個 channel');
                        }
                    }
                    resolve(result.ok);
                } catch (e) {
                    console.log('   ❌ 解析錯誤');
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

// 3. 測試發送訊息
async function testSendMessage() {
    console.log('\n3️⃣ 測試發送簡單訊息...');
    
    const message = {
        channel: SLACK_CHANNEL,
        text: '🧪 Slack Bot 診斷測試訊息',
        username: 'Diagnostic Bot',
        icon_emoji: ':gear:'
    };
    
    const payload = JSON.stringify(message);
    
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'slack.com',
            path: '/api/chat.postMessage',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log(`   狀態: ${result.ok ? '✅ 成功' : '❌ 失敗'}`);
                    if (result.ok) {
                        console.log(`   訊息時間: ${result.ts}`);
                        console.log(`   📱 請檢查 Slack #all-ags-mpc channel!`);
                    } else {
                        console.log(`   錯誤: ${result.error}`);
                        if (result.error === 'not_in_channel') {
                            console.log('   💡 Bot 需要被邀請到 channel');
                        } else if (result.error === 'missing_scope') {
                            console.log('   💡 Bot 缺少 chat:write 權限');
                        }
                    }
                    resolve(result.ok);
                } catch (e) {
                    console.log('   ❌ 解析錯誤');
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.write(payload);
        req.end();
    });
}

// 4. 檢查 Bot 權限
async function checkBotScopes() {
    console.log('\n4️⃣ 檢查 Bot 權限範圍...');
    
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'slack.com',
            path: '/api/auth.test',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.ok) {
                        console.log('   ✅ Bot Token 有效');
                        console.log('   💡 建議檢查的權限:');
                        console.log('     • chat:write - 發送訊息');
                        console.log('     • chat:write.public - 發送到公開 channel');
                        console.log('     • channels:read - 讀取 channel 資訊');
                    }
                    resolve(result.ok);
                } catch (e) {
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function main() {
    const authOk = await testBotAuth();
    const channelOk = await testChannelInfo();
    const messageOk = await testSendMessage();
    const scopeOk = await checkBotScopes();
    
    console.log('\n🎯 診斷結果摘要:');
    console.log('================');
    console.log(`Bot 認證: ${authOk ? '✅' : '❌'}`);
    console.log(`Channel 存取: ${channelOk ? '✅' : '❌'}`);
    console.log(`訊息發送: ${messageOk ? '✅' : '❌'}`);
    console.log(`權限檢查: ${scopeOk ? '✅' : '❌'}`);
    
    console.log('\n💡 解決建議:');
    if (!authOk) {
        console.log('🔧 Bot Token 問題:');
        console.log('   • 檢查 GitHub Secret SLACK_BOT_TOKEN 是否正確設置');
        console.log('   • Token 可能已過期，需要重新生成');
    }
    
    if (!channelOk) {
        console.log('🔧 Channel 問題:');
        console.log('   • 在 Slack 中邀請 Bot 到 #all-ags-mpc:');
        console.log('     /invite @你的bot名稱');
        console.log('   • 或檢查 Channel ID 是否正確');
    }
    
    if (!messageOk) {
        console.log('🔧 權限問題:');
        console.log('   • 前往 https://api.slack.com/apps');
        console.log('   • OAuth & Permissions → Bot Token Scopes');
        console.log('   • 添加 chat:write 和 chat:write.public');
        console.log('   • 重新安裝 App 到 workspace');
    }
    
    if (messageOk) {
        console.log('✅ 一切正常！GitHub Actions 應該能發送 Slack 通知');
    }
}

main().catch(console.error);