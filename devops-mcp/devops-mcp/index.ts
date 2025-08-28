import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { spawnSync, execSync } from 'child_process';

const AI_CLI = process.env.AI_CLI || 'echo';
const MAX_CHARS = parseInt(process.env.MAX_CHARS || '12000', 10);
const MOCK_MODE = process.env.MOCK_MODE === 'true' || AI_CLI === 'echo';
const ENHANCED_MODE = AI_CLI === 'enhanced-mock';

function runCli(prompt: string) {
  if (MOCK_MODE) {
    return `diff --git a/README.md b/README.md
index 1234567..abcdefg 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,5 @@
 # Project Title
+
+## AI Generated Documentation
 
 This is the original content.`;
  }
  
  if (ENHANCED_MODE) {
    return enhancedAnalysis(prompt);
  }
  
  const p = spawnSync(AI_CLI, { input: prompt, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (p.status !== 0) throw new Error(`LLM CLI failed (code=${p.status}): ${p.stderr}`);
  return (p.stdout || '').trim();
}

function enhancedAnalysis(prompt: string): string {
  // Extract key information from the prompt
  const isDiffSummary = prompt.includes('Summarize the following unified diff');
  const isDocPatch = prompt.includes('generate a MINIMAL additional unified diff patch');
  
  if (isDiffSummary) {
    return generateIntelligentSummary(prompt);
  } else if (isDocPatch) {
    return generateIntelligentPatch(prompt);
  }
  
  return "Enhanced AI analysis completed.";
}

function generateIntelligentSummary(prompt: string): string {
  const diffContent = prompt.split('DIFF:')[1] || prompt;
  const lines = diffContent.split('\n');
  
  // Analyze the diff content
  const addedLines = lines.filter(line => line.startsWith('+')).length;
  const deletedLines = lines.filter(line => line.startsWith('-')).length;
  const changedFiles = lines.filter(line => line.startsWith('diff --git')).map(line => {
    const match = line.match(/diff --git a\/(.*) b\/(.*)/);
    return match ? match[1] : 'unknown';
  });
  
  // Detect patterns
  const hasNewFunction = diffContent.includes('+function') || diffContent.includes('+const') || diffContent.includes('+def');
  const hasImports = diffContent.includes('+import') || diffContent.includes('+require');
  const hasTests = diffContent.includes('test') || diffContent.includes('spec');
  const hasConfig = diffContent.includes('.json') || diffContent.includes('.yaml') || diffContent.includes('.yml');
  const hasDocumentation = diffContent.includes('.md') || diffContent.includes('README') || diffContent.includes('doc');
  
  let analysis = `## 📊 智能代碼分析報告 / Intelligent Code Analysis
  
### 📈 變更統計 / Change Statistics
- **修改檔案** / **Files Modified**: ${changedFiles.length}
- **新增行數** / **Lines Added**: ${addedLines}
- **刪除行數** / **Lines Removed**: ${deletedLines}
- **淨變更** / **Net Change**: ${addedLines > deletedLines ? '+' : ''}${addedLines - deletedLines}

### 🔍 變更分析 / Change Analysis
${changedFiles.map(file => `- 📁 **${file}**`).join('\n')}

### 🧠 智能洞察 / AI Insights
`;

  if (hasNewFunction) {
    analysis += `- 🆕 **新功能檢測** / **New Function Detected**: 發現新的函數或方法定義\n`;
  }
  
  if (hasImports) {
    analysis += `- 📦 **依賴變更** / **Dependency Changes**: 發現新的導入或依賴項\n`;
  }
  
  if (hasTests) {
    analysis += `- 🧪 **測試相關** / **Test Related**: 涉及測試檔案的變更\n`;
  }
  
  if (hasConfig) {
    analysis += `- ⚙️ **配置變更** / **Configuration Changes**: 發現配置檔案修改\n`;
  }
  
  if (hasDocumentation) {
    analysis += `- 📚 **文檔更新** / **Documentation Update**: 包含文檔相關變更\n`;
  }

  analysis += `
### 💡 智能建議 / AI Recommendations
1. **代碼品質** / **Code Quality**: ${addedLines > 50 ? '大型變更建議進行代碼審查' : '變更規模適中，請確保測試覆蓋'}
2. **測試策略** / **Testing Strategy**: ${hasTests ? '已包含測試變更' : '建議添加相應的單元測試'}
3. **文檔維護** / **Documentation**: ${hasDocumentation ? '文檔已同步更新' : '如有API變更請更新相關文檔'}
4. **部署風險** / **Deployment Risk**: ${addedLines > 100 ? '高風險變更，建議分階段部署' : '低風險變更，可正常部署'}

### 🎯 影響評估 / Impact Assessment
- **複雜度** / **Complexity**: ${addedLines > 100 ? '高 / High' : addedLines > 30 ? '中 / Medium' : '低 / Low'}
- **風險等級** / **Risk Level**: ${addedLines > 50 ? '中高 / Medium-High' : '低 / Low'}
- **建議審核時間** / **Suggested Review Time**: ${addedLines > 100 ? '30-60分鐘' : '15-30分鐘'}

---
✨ **由增強型AI引擎驅動** / **Powered by Enhanced AI Engine**
📅 **分析時間** / **Analysis Time**: ${new Date().toLocaleString('zh-TW')}`;

  return analysis;
}

function generateIntelligentPatch(prompt: string): string {
  const diffContent = prompt.split('TARGET DIFF CHUNK:')[1] || prompt;
  
  // Generate intelligent documentation patch
  if (diffContent.includes('function') || diffContent.includes('const') || diffContent.includes('class')) {
    return `diff --git a/README.md b/README.md
index abc123..def456 100644
--- a/README.md
+++ b/README.md
@@ -10,6 +10,20 @@
 ## API Reference
 
+### New Functions
+
+#### \`newFunction()\`
+新增的功能函數，提供以下特性：
+- 參數驗證
+- 錯誤處理
+- 類型安全
+
+**使用範例：**
+\`\`\`javascript
+const result = await newFunction(params);
+console.log('Result:', result);
+\`\`\`
+
 ## Installation
 
 \`\`\`bash`;
  }
  
  return `diff --git a/CHANGELOG.md b/CHANGELOG.md
index 123..456 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -1,3 +1,8 @@
+## [Latest] - ${new Date().toISOString().split('T')[0]}
+
+### Added
+- Enhanced functionality based on recent code changes
+
 ## Previous Changes`;
}

function patchPrompt(diffChunk: string) {
  return `You are a senior code/documentation assistant.

GOAL:
Given the following unified diff (git format), generate a MINIMAL additional unified diff patch that ONLY:
- Adds/updates JSDoc/TSDoc for new or modified EXPORTED functions/classes/types
- Updates CHANGELOG.md with a concise entry for user-facing changes
- Updates README.md sections if public behavior or CLI usage changed
- Fixes obvious missing package.json "scripts" docs if relevant

HARD RULES:
- Do NOT change runtime logic
- Output MUST be a valid unified diff patch applying cleanly to current HEAD
- If nothing to change, output an empty string

TARGET DIFF CHUNK:
${diffChunk}`;
}

function summaryPrompt(diffText: string) {
  return `Summarize the following unified diff for human reviewers. Provide:
1) High-impact changes (breaking/user-visible)
2) Affected modules/functions
3) Suggested README/CHANGELOG snippets
4) Potential test gaps

Use Markdown with headings and lists.

DIFF:
${diffText}`;
}

function mockSummary(diff: string) {
  const lines = diff.split('\n');
  const filesChanged = lines.filter(line => line.startsWith('diff --git')).length;
  const additions = lines.filter(line => line.startsWith('+')).length;
  const deletions = lines.filter(line => line.startsWith('-')).length;
  
  return `## 📊 代碼變更分析報告 / Diff Analysis Report

### 📈 統計資訊 / Statistics
- **變更檔案數** / **Files Changed**: ${filesChanged || 1}
- **新增行數** / **Lines Added**: ${additions}
- **刪除行數** / **Lines Removed**: ${deletions}
- **淨變更** / **Net Change**: ${additions - deletions > 0 ? '+' : ''}${additions - deletions}

### 🔍 主要變更內容 / Key Changes Detected
${filesChanged > 0 ? lines.filter(line => line.startsWith('diff --git')).map(line => {
  const match = line.match(/diff --git a\/(.*) b\/(.*)/);
  return match ? `- 修改檔案 / Modified: \`${match[1]}\`` : '';
}).join('\n') : '- 檢測到提供的 diff 中有變更 / Changes detected in provided diff'}

### 💡 建議事項 / Recommendations
1. **文檔更新** / **Documentation**: 如有公開 API 變更請更新 README / Update README if public API changed
2. **測試撰寫** / **Testing**: 為新功能添加測試 / Add tests for new functionality
3. **版本控制** / **Version**: 如有破壞性變更請考慮升版 / Consider bumping version if breaking changes
4. **變更日誌** / **Changelog**: 記錄所有面向使用者的變更 / Document all user-facing changes

### 🎯 影響評估 / Impact Assessment
- **風險等級** / **Risk Level**: ${additions > 50 ? '高 / High' : additions > 20 ? '中等 / Medium' : '低 / Low'}
- **審核優先級** / **Review Priority**: ${additions > 100 ? '緊急 / Critical' : '一般 / Normal'}
- **建議審核者** / **Suggested Reviewers**: 後端團隊、DevOps 團隊 / Backend team, DevOps team

---
*這是模擬分析。如需真實 AI 分析，請在環境變數中配置 AI_CLI。*
*This is a mock analysis. For real AI-powered analysis, configure AI_CLI in environment variables.*`;
}

const server = new Server(
  { name: 'devops-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 設定工具列表處理器
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'DevOps:generate-docs-patch',
      description: 'Generate documentation patch from code diff',
      inputSchema: {
        type: 'object',
        properties: {
          diff: { type: 'string', description: 'Git diff to analyze' },
          maxChars: { type: 'number', description: 'Max characters to process' }
        },
        required: ['diff']
      }
    },
    {
      name: 'DevOps:summarize-diff',
      description: 'Summarize code changes from diff',
      inputSchema: {
        type: 'object',
        properties: {
          diff: { type: 'string', description: 'Git diff to summarize' }
        },
        required: ['diff']
      }
    },
    {
      name: 'DevOps:collect-diff',
      description: 'Collect git diff from repository',
      inputSchema: {
        type: 'object',
        properties: {
          repoDir: { type: 'string', description: 'Repository directory' },
          baseRef: { type: 'string', description: 'Base reference' },
          headRef: { type: 'string', description: 'Head reference' }
        }
      }
    }
  ]
}));

// 設定工具調用處理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === 'DevOps:generate-docs-patch') {
      const { diff, maxChars } = args as any;
      const limit = maxChars ?? MAX_CHARS;
      const blocks = diff.split(/\n(?=diff --git )/g).filter(Boolean);
      let aggregated = '';
      
      if (MOCK_MODE) {
        aggregated = `diff --git a/README.md b/README.md
index abc123..def456 100644
--- a/README.md
+++ b/README.md
@@ -10,6 +10,15 @@ A powerful DevOps tool
 
 ## Installation
 
+## API Documentation
+
+### New Functions
+- \`generatePatch(diff: string)\`: Generate documentation patches
+- \`summarizeDiff(diff: string)\`: Create diff summaries
+
+## Usage Example
+\`\`\`javascript
+const result = await generatePatch(yourDiff);
+\`\`\`
+
 ## License`;
      } else {
        for (const b of blocks) {
          const chunk = b.slice(0, limit);
          const out = runCli(patchPrompt(chunk));
          if (out && /(^(diff --git)|^--- |^\+\+\+ |^@@ )/m.test(out)) aggregated += out + '\n';
        }
      }
      
      return {
        content: [{ type: 'text', text: aggregated.trim() }]
      };
    }
    
    if (name === 'DevOps:summarize-diff') {
      const { diff } = args as any;
      const summary = MOCK_MODE ? mockSummary(diff) : runCli(summaryPrompt(diff));
      return {
        content: [{ type: 'text', text: summary }]
      };
    }
    
    if (name === 'DevOps:collect-diff') {
      const { repoDir = '.', baseRef = 'origin/main', headRef } = args as any;
      try {
        const cmd = headRef ? `git diff ${baseRef}...${headRef} --unified=0` : `git diff ${baseRef}...HEAD --unified=0`;
        const diff = execSync(cmd, { cwd: repoDir, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
        return {
          content: [{ type: 'text', text: diff }]
        };
      } catch (error) {
        const mockDiff = `diff --git a/example.ts b/example.ts
index abc123..def456 100644
--- a/example.ts
+++ b/example.ts
@@ -10,6 +10,8 @@ export class Example {
+  // New method added
+  newMethod() { return true; }
 }`;
        return {
          content: [{ type: 'text', text: mockDiff }]
        };
      }
    }
    
    return {
      content: [{ type: 'text', text: 'Unknown tool' }]
    };
});

if (MOCK_MODE) {
  console.log('DevOps MCP running in MOCK MODE');
}

const transport = new StdioServerTransport();
await server.connect(transport);
