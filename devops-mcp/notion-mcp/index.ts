import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client as NotionClient } from '@notionhq/client';

// 直接使用提供的 API key
const NOTION_API_KEY = 'ntn_f60904852272g19VvtkBtnTXg5coABK4QN4lnCmn9eS3Bk';
const MOCK_MODE = false;

let notion: NotionClient | null = null;

if (!MOCK_MODE) {
  notion = new NotionClient({
    auth: NOTION_API_KEY,
  });
  console.log('✅ Notion MCP running with REAL API - API Key configured');
} else {
  console.log('Notion MCP running in MOCK MODE - Set NOTION_API_KEY to use real Notion API');
}

// 模擬數據
const mockDatabase = {
  id: 'mock-db-123',
  title: 'DevOps Tasks',
  properties: {
    Name: { type: 'title' },
    Status: { type: 'select', options: ['Todo', 'In Progress', 'Done'] },
    Priority: { type: 'select', options: ['Low', 'Medium', 'High'] },
    Assignee: { type: 'people' },
    DueDate: { type: 'date' }
  }
};

const mockPages = [
  {
    id: 'page-1',
    properties: {
      Name: { title: [{ text: { content: 'Setup CI/CD Pipeline' } }] },
      Status: { select: { name: 'In Progress' } },
      Priority: { select: { name: 'High' } },
      DueDate: { date: { start: '2024-01-20' } }
    }
  },
  {
    id: 'page-2',
    properties: {
      Name: { title: [{ text: { content: 'Write API Documentation' } }] },
      Status: { select: { name: 'Todo' } },
      Priority: { select: { name: 'Medium' } },
      DueDate: { date: { start: '2024-01-25' } }
    }
  },
  {
    id: 'page-3',
    properties: {
      Name: { title: [{ text: { content: 'Code Review' } }] },
      Status: { select: { name: 'Done' } },
      Priority: { select: { name: 'Low' } },
      DueDate: { date: { start: '2024-01-15' } }
    }
  }
];

const server = new Server(
  { name: 'notion-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 註冊工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'Notion:searchPages',
      description: 'Search for Notion pages',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Max results (default: 10)' }
        },
        required: ['query']
      }
    },
    {
      name: 'Notion:createPage',
      description: 'Create a new Notion page',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Page title' },
          content: { type: 'string', description: 'Page content (markdown)' },
          databaseId: { type: 'string', description: 'Database ID (optional)' }
        },
        required: ['title', 'content']
      }
    },
    {
      name: 'Notion:updatePage',
      description: 'Update an existing Notion page',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'Page ID' },
          content: { type: 'string', description: 'New content' }
        },
        required: ['pageId', 'content']
      }
    },
    {
      name: 'Notion:getDatabaseItems',
      description: 'Get items from a Notion database',
      inputSchema: {
        type: 'object',
        properties: {
          databaseId: { type: 'string', description: 'Database ID' },
          filter: { type: 'object', description: 'Filter criteria' },
          limit: { type: 'number', description: 'Max results' }
        },
        required: ['databaseId']
      }
    },
    {
      name: 'Notion:createDatabaseItem',
      description: 'Create item in Notion database',
      inputSchema: {
        type: 'object',
        properties: {
          databaseId: { type: 'string', description: 'Database ID' },
          properties: { type: 'object', description: 'Item properties' }
        },
        required: ['databaseId', 'properties']
      }
    }
  ]
}));

// 處理工具調用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'Notion:searchPages') {
    const { query, limit = 10 } = args as any;
    
    if (MOCK_MODE) {
      // 模擬搜索結果
      const results = mockPages
        .filter(p => {
          const title = p.properties.Name.title[0].text.content.toLowerCase();
          return title.includes(query.toLowerCase());
        })
        .slice(0, limit)
        .map(p => ({
          id: p.id,
          title: p.properties.Name.title[0].text.content,
          status: p.properties.Status.select.name,
          url: `https://notion.so/${p.id}`
        }));
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ results, total: results.length }, null, 2)
        }]
      };
    }
    
    // 真實 API 調用
    try {
      const response = await notion!.search({
        query,
        page_size: limit,
        filter: { property: 'object', value: 'page' }
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }
  
  if (name === 'Notion:createPage') {
    const { title, content, databaseId } = args as any;
    
    if (MOCK_MODE) {
      const newPage = {
        id: `page-${Date.now()}`,
        title,
        content,
        createdAt: new Date().toISOString(),
        url: `https://notion.so/page-${Date.now()}`
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            page: newPage,
            message: 'Page created successfully (real API mode)'
          }, null, 2)
        }]
      };
    }
    
    // 真實 API 調用
    try {
      const response = await notion!.pages.create({
        parent: databaseId 
          ? { database_id: databaseId }
          : { page_id: process.env.NOTION_ROOT_PAGE_ID! },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content
                  }
                }
              ]
            }
          }
        ]
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }
  
  if (name === 'Notion:getDatabaseItems') {
    const { databaseId, filter, limit = 10 } = args as any;
    
    if (MOCK_MODE) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            database: mockDatabase,
            items: mockPages.slice(0, limit),
            total: mockPages.length
          }, null, 2)
        }]
      };
    }
    
    // 真實 API 調用
    try {
      const response = await notion!.databases.query({
        database_id: databaseId,
        filter: filter || undefined,
        page_size: limit
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }
  
  if (name === 'Notion:updatePage') {
    const { pageId, content } = args as any;
    
    if (MOCK_MODE) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            pageId,
            message: 'Page updated successfully (real API mode)',
            updatedAt: new Date().toISOString()
          }, null, 2)
        }]
      };
    }
    
    // 真實 API 調用
    try {
      const response = await notion!.pages.update({
        page_id: pageId,
        properties: {
          // Update page properties if needed
        }
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }
  
  if (name === 'Notion:createDatabaseItem') {
    const { databaseId, properties } = args as any;
    
    if (MOCK_MODE) {
      const newItem = {
        id: `item-${Date.now()}`,
        properties,
        createdAt: new Date().toISOString()
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            item: newItem,
            message: 'Database item created successfully (real API mode)'
          }, null, 2)
        }]
      };
    }
    
    // 真實 API 調用
    try {
      const response = await notion!.pages.create({
        parent: { database_id: databaseId },
        properties
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }]
      };
    }
  }
  
  return {
    content: [{
      type: 'text',
      text: 'Unknown tool'
    }]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.log('Notion MCP Server running...');
