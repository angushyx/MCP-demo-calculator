import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// 檢查是否為模擬模式
const MOCK_MODE = !process.env.SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN.startsWith('xoxb-test');

let slack: any;

if (!MOCK_MODE) {
  const { WebClient } = await import('@slack/web-api');
  slack = new WebClient(process.env.SLACK_BOT_TOKEN);
} else {
  // 模擬 Slack client
  slack = {
    chat: {
      postMessage: async (params: any) => {
        console.log('Mock Slack postMessage:', params);
        return { ok: true, ts: Date.now().toString() };
      }
    },
    files: {
      upload: async (params: any) => {
        console.log('Mock Slack uploadFile:', params);
        return { ok: true, file: { id: 'mock-file-id' } };
      }
    }
  };
  console.log('Slack MCP running in MOCK MODE');
}

const server = new Server(
  { name: 'slack-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 設定工具列表處理器
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'Slack:postMessage',
      description: 'Post a message to Slack',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Channel ID' },
          text: { type: 'string', description: 'Message text' },
          thread_ts: { type: 'string', description: 'Thread timestamp' }
        },
        required: ['channel', 'text']
      }
    },
    {
      name: 'Slack:replyInThread',
      description: 'Reply to a Slack thread',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Channel ID' },
          thread_ts: { type: 'string', description: 'Thread timestamp' },
          text: { type: 'string', description: 'Reply text' }
        },
        required: ['channel', 'thread_ts', 'text']
      }
    },
    {
      name: 'Slack:uploadFile',
      description: 'Upload a file to Slack',
      inputSchema: {
        type: 'object',
        properties: {
          channels: { type: 'string', description: 'Channels to share' },
          filename: { type: 'string', description: 'File name' },
          content: { type: 'string', description: 'File content' }
        },
        required: ['channels', 'filename', 'content']
      }
    }
  ]
}));

// 設定工具調用處理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === 'Slack:postMessage') {
      const { channel, text, thread_ts } = args as any;
      const r = await slack.chat.postMessage({ channel, text, thread_ts });
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: r.ok, ts: r.ts }) }]
      };
    }
    
    if (name === 'Slack:replyInThread') {
      const { channel, thread_ts, text } = args as any;
      const r = await slack.chat.postMessage({ channel, text, thread_ts });
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: r.ok, ts: r.ts }) }]
      };
    }
    
    if (name === 'Slack:uploadFile') {
      const { channels, filename, content } = args as any;
      const r = await slack.files.upload({ channels, filename, content });
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: r.ok, file: r.file?.id }) }]
      };
    }
    
    return {
      content: [{ type: 'text', text: 'Unknown tool' }]
    };
});

const transport = new StdioServerTransport();
await server.connect(transport);
