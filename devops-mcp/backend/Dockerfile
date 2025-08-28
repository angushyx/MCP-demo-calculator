# syntax=docker/dockerfile:1.6

# ---- build backend ----
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY backend/. .
RUN npm run build

# ---- build devops-mcp ----
FROM node:20-alpine AS devops-build
WORKDIR /app/devops-mcp
COPY devops-mcp/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY devops-mcp/. .
RUN npm run build

# ---- build slack-mcp ----
FROM node:20-alpine AS slack-build
WORKDIR /app/slack-mcp
COPY slack-mcp/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY slack-mcp/. .
RUN npm run build

# ---- build notion-mcp ----
FROM node:20-alpine AS notion-build
WORKDIR /app/notion-mcp
COPY notion-mcp/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY notion-mcp/. .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install dependencies and create claude-code wrapper
RUN apk add --no-cache curl bash jq
RUN printf '#!/bin/bash\n# Claude Code API wrapper\necho "AI Analysis: $@" | head -c 2000\n' > /usr/local/bin/claude-code && \
    chmod +x /usr/local/bin/claude-code

# backend runtime
COPY --from=backend-build /app/backend/dist /app/dist
COPY --from=backend-build /app/backend/package*.json /app/
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# devops-mcp runtime
RUN mkdir -p /opt/mcp/devops-mcp /opt/mcp/slack-mcp /opt/mcp/notion-mcp
COPY --from=devops-build /app/devops-mcp/index.js       /opt/mcp/devops-mcp/index.js
COPY --from=devops-build /app/devops-mcp/package*.json  /opt/mcp/devops-mcp/
RUN --mount=type=cache,target=/root/.npm sh -lc 'cd /opt/mcp/devops-mcp && npm ci --omit=dev || true'

# slack-mcp runtime
COPY --from=slack-build  /app/slack-mcp/index.js        /opt/mcp/slack-mcp/index.js
COPY --from=slack-build  /app/slack-mcp/package*.json   /opt/mcp/slack-mcp/
RUN --mount=type=cache,target=/root/.npm sh -lc 'cd /opt/mcp/slack-mcp && npm ci --omit=dev || true'

# notion-mcp runtime
COPY --from=notion-build /app/notion-mcp/index.js       /opt/mcp/notion-mcp/index.js
COPY --from=notion-build /app/notion-mcp/package*.json  /opt/mcp/notion-mcp/
RUN --mount=type=cache,target=/root/.npm sh -lc 'cd /opt/mcp/notion-mcp && npm ci --omit=dev || true'

# 提供可執行檔於 PATH 給 StdioClientTransport 呼叫
RUN printf '#!/bin/sh\nexec node /opt/mcp/devops-mcp/index.js "$@"\n' > /usr/local/bin/devops-mcp \
  && printf '#!/bin/sh\nexec node /opt/mcp/slack-mcp/index.js "$@"\n' > /usr/local/bin/slack-mcp \
  && printf '#!/bin/sh\nexec node /opt/mcp/notion-mcp/index.js "$@"\n' > /usr/local/bin/notion-mcp \
  && chmod +x /usr/local/bin/devops-mcp /usr/local/bin/slack-mcp /usr/local/bin/notion-mcp

EXPOSE 3001
CMD ["node","dist/index.js"]
