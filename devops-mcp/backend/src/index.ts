import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MCPClient } from './mcp-client.js';
import devopsAIRoutes from './routes/devops-ai.js';
import slackRoutes from './routes/slack.js';
import notionRoutes from './routes/notion.js';
import cicdRoutes from './routes/ci-cd.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Slack raw-body endpoints（必須在 json() 之前掛載）
const rawJson = express.raw({ type: 'application/json' });
const urlencoded = express.urlencoded({ extended: true });
app.post('/api/slack/events', rawJson, (req:any,_res,next)=>{ req.rawBody = req.body.toString(); req.body = JSON.parse(req.rawBody||'{}'); next(); });
app.post('/api/slack/commands', urlencoded, (req:any,_res,next)=>{ req.rawBody = new URLSearchParams(req.body).toString(); next(); });

// 一般中介
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const mcpClient = new MCPClient();

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// 路由
app.use('/api/devops/ai', devopsAIRoutes(mcpClient));
app.use('/api/slack', slackRoutes(mcpClient));
app.use('/api/notion', notionRoutes(mcpClient));
app.use('/api/ci-cd', cicdRoutes(mcpClient));

// 錯誤處理
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

async function start() {
  await mcpClient.initialize();
  app.listen(PORT, () => console.log(`🚀 Backend http://localhost:${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });
