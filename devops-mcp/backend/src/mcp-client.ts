import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'node:child_process';
import * as path from 'node:path';

export class MCPClient {
  private clients = new Map<string, Client>();
  
  async initialize() {
    // 連接所有 MCP 服務
    await this.connectToLocalService('devops', 'devops-mcp');
    await this.connectToLocalService('slack', 'slack-mcp');
    await this.connectToLocalService('notion', 'notion-mcp');
  }
  
  private async connectToLocalService(name: string, command: string) {
    try {
      // 使用 Docker 容器中的可執行檔
      console.log(`Connecting to ${name} at ${command}...`);
      
      const transport = new StdioClientTransport({ 
        command: command,
        args: [],
        env: { ...process.env, NOTION_API_KEY: process.env.NOTION_API_KEY || 'ntn_f60904852272g19VvtkBtnTXg5coABK4QN4lnCmn9eS3Bk' }
      });
      
      const client = new Client({ 
        name: `${name}-client`, 
        version: '1.0.0' 
      }, { 
        capabilities: {} 
      });
      
      await client.connect(transport);
      this.clients.set(name, client);
      console.log(`✅ Connected to ${name} MCP service`);
    } catch (error) {
      console.error(`⚠️ Failed to connect to ${name}: ${error}`);
      // 不要拋出錯誤，讓服務繼續運行
    }
  }
  
  async callTool(service: string, toolName: string, args: any) {
    const client = this.clients.get(service);
    if (!client) {
      console.warn(`Service ${service} not connected, returning mock response`);
      
      // 返回模擬響應
      if (service === 'devops') {
        if (toolName.includes('summarize')) {
          return [{ type: 'text', text: '## Mock Summary\n\nThis is a mock response. Service not connected.' }];
        }
        return [{ type: 'text', text: 'Mock patch response' }];
      }
      
      if (service === 'notion') {
        return [{ type: 'text', text: JSON.stringify({ 
          success: false, 
          message: 'Notion service not connected (mock mode)',
          mockData: true 
        }, null, 2) }];
      }
      
      return [{ type: 'text', text: JSON.stringify({ ok: true, mock: true }) }];
    }
    
    try {
      const result = await client.callTool({ name: toolName, arguments: args });
      return result.content;
    } catch (error) {
      console.error(`Error calling tool ${toolName} on ${service}:`, error);
      return [{ type: 'text', text: `Error: ${error}` }];
    }
  }
}
