# Production Configuration

## Environment Variables

### Backend (.env.production)
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# AI Configuration
AI_CLI=claude-code
MAX_CHARS=20000

# API Keys (Required for production)
API_KEY=your-secure-api-key

# Slack Integration
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token

# Notion Integration
NOTION_API_KEY=secret_your-notion-api-key
NOTION_ROOT_PAGE_ID=your-root-page-id
```

## Docker Production Build

### Backend Dockerfile.prod
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Nginx Configuration

### nginx.conf
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Security Checklist

### Required for Production

- [ ] Set strong API_KEY
- [ ] Configure HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Configure CSP headers
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling
- [ ] Set up health checks

### Environment-Specific Settings

#### Development
- Mock mode enabled
- Debug logging
- Hot reload
- CORS open

#### Staging
- Real APIs with test keys
- Limited rate limits
- Monitoring enabled
- CORS restricted

#### Production
- Real APIs with production keys
- Strict rate limits
- Full monitoring
- CORS locked down
- SSL required

## Monitoring

### Recommended Tools
- **APM**: New Relic, DataDog
- **Logs**: ELK Stack, CloudWatch
- **Uptime**: Pingdom, UptimeRobot
- **Errors**: Sentry, Rollbar

### Health Check Endpoints
- `/health` - Basic health
- `/api/health/detailed` - Detailed status
- `/api/metrics` - Prometheus metrics

## Deployment Commands

### Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
kubectl apply -f deploy/k8s/production/
```

### PM2
```bash
pm2 start ecosystem.config.js --env production
```

## Backup Strategy

### Database Backups
- Daily automated backups
- 30-day retention
- Off-site storage

### Configuration Backups
- Version controlled
- Encrypted secrets
- Disaster recovery plan
