// 🔧 Slack Webhook 完整診斷工具
const https = require('https');
const { URL } = require('url');

console.log('🔧 Slack Webhook 診斷工具');
console.log('========================');

const CURRENT_WEBHOOK = 'https://hooks.slack.com/services/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';

async function testWebhook(webhookUrl, testName, payload) {
    console.log(`\n🧪 測試 ${testName}...`);
    console.log(`🔗 URL: ${webhookUrl.substring(0, 50)}...`);
    
    try {
        const url = new URL(webhookUrl);
        const data = JSON.stringify(payload);
        
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
                        headers: res.headers,
                        body: responseData,
                        success: res.statusCode === 200
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
        
        return result;
        
    } catch (error) {
        console.log(`❌ 錯誤: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('開始完整 Slack 測試...\n');
    
    // 測試1: 最簡單的訊息
    const simpleTest = await testWebhook(CURRENT_WEBHOOK, '簡單文字訊息', {
        text: "🧪 Slack 測試訊息"
    });
    
    // 測試2: 帶附件的訊息
    const richTest = await testWebhook(CURRENT_WEBHOOK, '豐富格式訊息', {
        text: "🧪 MCP Calculator 測試",
        attachments: [{
            color: "good",
            title: "測試通知",
            text: "這是一個測試訊息",
            footer: "MCP Test",
            ts: Math.floor(Date.now() / 1000)
        }]
    });
    
    // 測試3: 完整 MCP 格式
    const mcpTest = await testWebhook(CURRENT_WEBHOOK, 'MCP 完整格式', {
        text: "🎉 MCP Calculator 自動化測試",
        attachments: [{
            color: "good",
            title: "📋 發佈筆記",
            title_link: "https://notion.so/test",
            fields: [
                { title: "Repository", value: "angushyx/MCP-demo-calculator", short: true },
                { title: "Status", value: "✅ 測試中", short: true }
            ],
            footer: "MCP Calculator Pipeline",
            ts: Math.floor(Date.now() / 1000)
        }]
    });
    
    console.log('\n🎯 診斷結果摘要:');
    console.log('=================');
    console.log(`1. 簡單訊息: ${simpleTest.success ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`2. 豐富訊息: ${richTest.success ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`3. MCP 格式: ${mcpTest.success ? '✅ 成功' : '❌ 失敗'}`);
    
    if (!simpleTest.success) {
        console.log('\n🚨 問題診斷:');
        console.log('============');
        
        if (simpleTest.body === 'no_service') {
            console.log('❌ Webhook URL 已失效或被刪除');
            console.log('💡 解決方案: 需要重新創建 Slack Webhook');
            console.log('📱 步驟:');
            console.log('   1. 前往 https://api.slack.com/apps');
            console.log('   2. 選擇你的 Slack App');
            console.log('   3. 點選 "Incoming Webhooks"');
            console.log('   4. 刪除現有 webhook 並創建新的');
            console.log('   5. 複製新的 webhook URL');
        } else if (simpleTest.statusCode === 404) {
            console.log('❌ Webhook URL 不存在或路徑錯誤');
        } else if (simpleTest.statusCode === 403) {
            console.log('❌ 權限被拒絕，App 可能被移除或停用');
        } else {
            console.log(`❌ 未知錯誤: ${simpleTest.body || simpleTest.error}`);
        }
    } else {
        console.log('\n✅ Slack 連接正常！');
        console.log('💡 如果 GitHub Actions 中沒收到通知，問題可能在 workflow 設定');
    }
    
    console.log('\n🔧 下一步建議:');
    if (!simpleTest.success) {
        console.log('1. 重新設置 Slack Webhook URL');
        console.log('2. 測試新的 URL');
        console.log('3. 更新 GitHub Actions workflow');
    } else {
        console.log('1. 檢查 GitHub Actions logs');
        console.log('2. 確認 workflow 中的 Slack 步驟執行');
        console.log('3. 驗證步驟間的資料傳遞');
    }
}

main().catch(console.error);