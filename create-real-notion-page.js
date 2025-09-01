// 🧮 真實創建 Notion 頁面測試
const https = require('https');

console.log('🚀 真實創建 Notion 頁面測試...');
console.log('================================');

const NOTION_API_KEY = 'ntn_f60904852272g19VvtkBtnTXg5coABK4QN4lnCmn9eS3Bk';

// 先搜索可用的頁面作為 parent
async function findAvailableParent() {
    console.log('🔍 搜索可用的 Notion 頁面...');
    
    const searchData = JSON.stringify({
        query: "",
        page_size: 10,
        filter: {
            value: "page",
            property: "object"
        }
    });
    
    const options = {
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
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(searchData);
        req.end();
    });
}

async function createNotionPage(parentId) {
    console.log('📝 創建 Notion 頁面...');
    
    const pageData = JSON.stringify({
        parent: {
            type: "page_id",
            page_id: parentId
        },
        properties: {
            title: {
                title: [
                    {
                        text: {
                            content: "🧮 MCP Calculator Release Notes"
                        }
                    }
                ]
            }
        },
        children: [
            {
                object: "block",
                type: "heading_1",
                heading_1: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "📋 Calculator Release Notes"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "Repository: angushyx/MCP-demo-calculator"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: `Date: ${new Date().toISOString().split('T')[0]}`
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "🔄 主要變更"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "✅ 完成 MCP Notion 整合"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "✅ 完成 MCP Slack 整合"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "✅ 修復 GitHub Actions 流程"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "📊 統計資訊"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "Files Changed: 5\nLines Added: +173\nLines Removed: -2"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: "🤖 Auto-generated by MCP Calculator Pipeline"
                            },
                            annotations: {
                                italic: true
                            }
                        }
                    ]
                }
            }
        ]
    });
    
    const options = {
        hostname: 'api.notion.com',
        port: 443,
        path: '/v1/pages',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
            'Content-Length': Buffer.byteLength(pageData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: result
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
        req.write(pageData);
        req.end();
    });
}

async function main() {
    try {
        // 1. 搜索可用的 parent 頁面
        const searchResult = await findAvailableParent();
        
        if (searchResult.results && searchResult.results.length > 0) {
            console.log('✅ 找到', searchResult.results.length, '個可用頁面');
            
            const firstPage = searchResult.results[0];
            console.log('📄 使用頁面:', firstPage.properties?.title?.title?.[0]?.text?.content || 'Untitled');
            console.log('🔗 Page ID:', firstPage.id);
            
            // 2. 創建子頁面
            const createResult = await createNotionPage(firstPage.id);
            
            if (createResult.status === 200) {
                console.log('🎉 成功創建 Notion 頁面！');
                console.log('📋 頁面標題:', createResult.data.properties?.title?.title?.[0]?.text?.content);
                console.log('🔗 頁面 URL:', createResult.data.url);
                console.log('📅 創建時間:', createResult.data.created_time);
                
                return true;
            } else {
                console.error('❌ 創建頁面失敗:', createResult.status);
                console.error('💬 錯誤訊息:', createResult.data.message || 'Unknown error');
                
                return false;
            }
            
        } else {
            console.error('❌ 沒有找到可用的 parent 頁面');
            console.log('💡 建議: 在 Notion 中創建一個頁面，並確保 API Key 有權限存取');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 執行失敗:', error.message);
        return false;
    }
}

main().then(success => {
    console.log('');
    console.log('🎯 測試結果:', success ? '✅ 成功' : '❌ 失敗');
    console.log('');
    console.log('💡 如果成功，你應該在 Notion 中看到新創建的頁面！');
    console.log('🔗 請檢查你的 Notion workspace 中的新頁面');
});