import { Router } from 'express';
import crypto from 'crypto';
import { MCPClient } from '../mcp-client.js';

function verifySlack(req: any, res: any, next: any) {
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  if (!ts || !sig) return res.status(401).send('Missing headers');
  if (Math.abs(Date.now()/1000 - Number(ts)) > 300) return res.status(401).send('Stale');
  const body = req.rawBody as string;
  const base = `v0:${ts}:${body}`;
  const mySig = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET!).update(base).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(mySig), Buffer.from(sig as string))) return res.status(401).send('Bad sig');
  next();
}

export default function slackRoutes(mcp: MCPClient) {
  const r = Router();
  
  r.post('/events', verifySlack, async (req: any, res) => {
    const payload = req.body;
    if (payload.type === 'url_verification') return res.send(payload.challenge);
    const event = payload.event;
    if (event?.type === 'app_mention') {
      const text: string = event.text || '';
      const content = await mcp.callTool('devops', 'DevOps:summarize-diff', { diff: text });
      const summary = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      await mcp.callTool('slack', 'Slack:replyInThread', { 
        channel: event.channel, 
        thread_ts: event.ts, 
        text: summary || '貼 unified diff 或用 /ai-summary' 
      });
    }
    return res.send('ok');
  });
  
  r.post('/commands', verifySlack, async (req: any, res) => {
    const { command, text, channel_id } = req.body as Record<string,string>;
    if (command === '/ai-summary') {
      const content = await mcp.callTool('devops', 'DevOps:summarize-diff', { diff: text });
      const md = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      await mcp.callTool('slack', 'Slack:postMessage', { channel: channel_id, text: md.slice(0, 3800) });
      return res.status(200).send('Generating summary…');
    }
    if (command === '/ai-docs') {
      const content = await mcp.callTool('devops', 'DevOps:generate-docs-patch', { diff: text });
      const patch = Array.isArray(content) ? (content.find((c:any)=>c.type==='text')?.text ?? '') : '';
      await mcp.callTool('slack', 'Slack:uploadFile', { 
        channels: channel_id, 
        filename: 'ai.patch', 
        content: patch || '/* no patch */' 
      });
      return res.status(200).send('Patch uploaded');
    }
    return res.status(200).send('Unknown command');
  });
  
  return r;
}
