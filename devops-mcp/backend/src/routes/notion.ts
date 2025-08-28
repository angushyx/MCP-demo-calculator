import { Router } from 'express';
import { z } from 'zod';
import { MCPClient } from '../mcp-client.js';

export default function notionRoutes(mcp: MCPClient) {
  const router = Router();
  
  // 搜索頁面
  router.get('/search', async (req, res, next) => {
    try {
      const params = z.object({
        query: z.string().min(1),
        limit: z.string().transform(val => parseInt(val) || 10).optional().default("10")
      }).parse(req.query);
      
      const content = await mcp.callTool('notion', 'Notion:searchPages', params);
      const result = Array.isArray(content) ? 
        (content.find((c: any) => c.type === 'text')?.text ?? '{}') : '{}';
      
      try {
        res.json(JSON.parse(result));
      } catch (parseError) {
        res.status(500).json({ error: 'Invalid response from MCP service', details: result });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // 創建頁面
  router.post('/pages', async (req, res, next) => {
    try {
      const params = z.object({
        title: z.string().min(1),
        content: z.string(),
        databaseId: z.string().optional()
      }).parse(req.body);
      
      const content = await mcp.callTool('notion', 'Notion:createPage', params);
      const result = Array.isArray(content) ? 
        (content.find((c: any) => c.type === 'text')?.text ?? '{}') : '{}';
      
      try {
        res.json(JSON.parse(result));
      } catch (parseError) {
        res.status(500).json({ error: 'Invalid response from MCP service', details: result });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // 更新頁面
  router.put('/pages/:pageId', async (req, res, next) => {
    try {
      const params = z.object({
        pageId: z.string(),
        content: z.string()
      }).parse({
        pageId: req.params.pageId,
        ...req.body
      });
      
      const content = await mcp.callTool('notion', 'Notion:updatePage', params);
      const result = Array.isArray(content) ? 
        (content.find((c: any) => c.type === 'text')?.text ?? '{}') : '{}';
      
      try {
        res.json(JSON.parse(result));
      } catch (parseError) {
        res.status(500).json({ error: 'Invalid response from MCP service', details: result });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // 獲取資料庫項目
  router.get('/databases/:databaseId/items', async (req, res, next) => {
    try {
      const params = z.object({
        databaseId: z.string(),
        filter: z.object({}).optional(),
        limit: z.string().transform(val => parseInt(val) || 10).optional().default("10")
      }).parse({
        databaseId: req.params.databaseId,
        ...req.query
      });
      
      const content = await mcp.callTool('notion', 'Notion:getDatabaseItems', params);
      const result = Array.isArray(content) ? 
        (content.find((c: any) => c.type === 'text')?.text ?? '{}') : '{}';
      
      try {
        res.json(JSON.parse(result));
      } catch (parseError) {
        res.status(500).json({ error: 'Invalid response from MCP service', details: result });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // 創建資料庫項目
  router.post('/databases/:databaseId/items', async (req, res, next) => {
    try {
      const params = z.object({
        databaseId: z.string(),
        properties: z.object({})
      }).parse({
        databaseId: req.params.databaseId,
        properties: req.body.properties
      });
      
      const content = await mcp.callTool('notion', 'Notion:createDatabaseItem', params);
      const result = Array.isArray(content) ? 
        (content.find((c: any) => c.type === 'text')?.text ?? '{}') : '{}';
      
      try {
        res.json(JSON.parse(result));
      } catch (parseError) {
        res.status(500).json({ error: 'Invalid response from MCP service', details: result });
      }
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}
