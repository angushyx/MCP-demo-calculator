import { Router } from 'express';
import { z } from 'zod';
import { MCPClient } from '../mcp-client.js';

export default function devopsAIRoutes(mcp: MCPClient) {
  const r = Router();
  
  r.post('/generate-patch', async (req, res, next) => {
    try {
      const p = z.object({ diff: z.string().min(1), maxChars: z.number().optional() }).parse(req.body);
      const content = await mcp.callTool('devops', 'DevOps:generate-docs-patch', p);
      const text = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      res.type('text/plain').send(text);
    } catch (e) { next(e); }
  });
  
  r.post('/summarize', async (req, res, next) => {
    try {
      const p = z.object({ diff: z.string().min(1) }).parse(req.body);
      const content = await mcp.callTool('devops', 'DevOps:summarize-diff', p);
      const text = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      res.type('text/markdown').send(text);
    } catch (e) { next(e); }
  });
  
  r.get('/collect-diff', async (req, res, next) => {
    try {
      const q = z.object({ 
        repoDir: z.string().default('.'), 
        baseRef: z.string().default('origin/main'), 
        headRef: z.string().optional() 
      }).parse(req.query);
      const content = await mcp.callTool('devops', 'DevOps:collect-diff', q);
      const text = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      res.type('text/plain').send(text);
    } catch (e) { next(e); }
  });
  
  return r;
}
