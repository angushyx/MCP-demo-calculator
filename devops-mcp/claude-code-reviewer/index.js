#!/usr/bin/env node
/**
 * 🤖 Claude Code Reviewer MCP Service
 * 使用 Claude API 進行智能代碼審查
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import Anthropic from '@anthropic-ai/sdk';

// 環境配置
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const MOCK_MODE = !CLAUDE_API_KEY;

let anthropic = null;
if (!MOCK_MODE) {
    anthropic = new Anthropic({
        apiKey: CLAUDE_API_KEY,
    });
    console.log('✅ Claude Code Reviewer MCP running with REAL Claude API');
} else {
    console.log('⚠️ Claude Code Reviewer MCP running in MOCK MODE - Set CLAUDE_API_KEY to use real Claude API');
}

const server = new Server(
    { name: 'claude-code-reviewer', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

// 工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'CodeReviewer:reviewDiff',
                description: 'Review code changes using Claude AI',
                inputSchema: {
                    type: 'object',
                    properties: {
                        diff: { type: 'string', description: 'Git diff content' },
                        context: { type: 'string', description: 'Additional context about the changes' },
                        focus: { 
                            type: 'string', 
                            description: 'Focus areas: security, performance, bugs, style, all',
                            enum: ['security', 'performance', 'bugs', 'style', 'all'],
                            default: 'all'
                        }
                    },
                    required: ['diff']
                }
            },
            {
                name: 'CodeReviewer:reviewFile',
                description: 'Review a specific file using Claude AI',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: { type: 'string', description: 'File path' },
                        content: { type: 'string', description: 'File content' },
                        language: { type: 'string', description: 'Programming language' }
                    },
                    required: ['content']
                }
            },
            {
                name: 'CodeReviewer:suggestImprovements',
                description: 'Suggest code improvements using Claude AI',
                inputSchema: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', description: 'Code to improve' },
                        requirements: { type: 'string', description: 'Specific requirements or goals' }
                    },
                    required: ['code']
                }
            }
        ]
    };
});

// 工具調用處理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    console.log(`🔧 Calling tool: ${name}`);
    
    if (name === 'CodeReviewer:reviewDiff') {
        return await reviewDiff(args);
    }
    
    if (name === 'CodeReviewer:reviewFile') {
        return await reviewFile(args);
    }
    
    if (name === 'CodeReviewer:suggestImprovements') {
        return await suggestImprovements(args);
    }
    
    throw new Error(`Unknown tool: ${name}`);
});

// 代碼差異審查
async function reviewDiff(args) {
    const { diff, context = '', focus = 'all' } = args;
    
    if (MOCK_MODE) {
        return generateMockReview(diff, 'diff', focus);
    }
    
    try {
        const prompt = createDiffReviewPrompt(diff, context, focus);
        
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        const review = message.content[0].text;
        
        return {
            content: [{
                type: 'text',
                text: `# 🤖 Claude Code Review Results\n\n${review}\n\n---\n*Reviewed by Claude 3.5 Sonnet*`
            }]
        };
        
    } catch (error) {
        console.error('Claude API Error:', error);
        return {
            content: [{
                type: 'text',
                text: `❌ Code review failed: ${error.message}`
            }]
        };
    }
}

// 單個文件審查
async function reviewFile(args) {
    const { filePath = 'unknown', content, language = 'auto' } = args;
    
    if (MOCK_MODE) {
        return generateMockReview(content, 'file', 'all');
    }
    
    try {
        const prompt = createFileReviewPrompt(content, filePath, language);
        
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        const review = message.content[0].text;
        
        return {
            content: [{
                type: 'text',
                text: `# 🔍 File Review: ${filePath}\n\n${review}\n\n---\n*Reviewed by Claude 3.5 Sonnet*`
            }]
        };
        
    } catch (error) {
        console.error('Claude API Error:', error);
        return {
            content: [{
                type: 'text',
                text: `❌ File review failed: ${error.message}`
            }]
        };
    }
}

// 代碼改進建議
async function suggestImprovements(args) {
    const { code, requirements = '' } = args;
    
    if (MOCK_MODE) {
        return generateMockReview(code, 'improvement', 'all');
    }
    
    try {
        const prompt = createImprovementPrompt(code, requirements);
        
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        const suggestions = message.content[0].text;
        
        return {
            content: [{
                type: 'text',
                text: `# 💡 Code Improvement Suggestions\n\n${suggestions}\n\n---\n*Suggested by Claude 3.5 Sonnet*`
            }]
        };
        
    } catch (error) {
        console.error('Claude API Error:', error);
        return {
            content: [{
                type: 'text',
                text: `❌ Code improvement failed: ${error.message}`
            }]
        };
    }
}

// 創建差異審查提示
function createDiffReviewPrompt(diff, context, focus) {
    const focusInstruction = {
        'security': 'Focus primarily on security vulnerabilities, input validation, and potential exploits.',
        'performance': 'Focus on performance issues, inefficient algorithms, and optimization opportunities.',
        'bugs': 'Focus on potential bugs, logic errors, and edge cases.',
        'style': 'Focus on code style, readability, and best practices.',
        'all': 'Provide a comprehensive review covering security, performance, bugs, and style.'
    };
    
    return `You are an expert code reviewer. Please review the following Git diff and provide detailed feedback.

${focusInstruction[focus]}

Context: ${context}

Git Diff:
\`\`\`diff
${diff}
\`\`\`

Please provide:
1. 🔍 **Summary**: Brief overview of the changes
2. ✅ **Strengths**: What's done well
3. ⚠️ **Issues**: Problems or concerns found
4. 💡 **Suggestions**: Specific improvement recommendations
5. 🛡️ **Security**: Security considerations (if any)
6. ⚡ **Performance**: Performance implications (if any)

Format your response in clear sections with emojis and be specific about line numbers when possible.`;
}

// 創建文件審查提示
function createFileReviewPrompt(content, filePath, language) {
    return `You are an expert code reviewer. Please review this ${language} file: ${filePath}

File Content:
\`\`\`${language}
${content}
\`\`\`

Please provide:
1. 🔍 **Overview**: What this code does
2. ✅ **Good Practices**: Well-implemented patterns
3. ⚠️ **Issues**: Problems or concerns
4. 💡 **Improvements**: Specific suggestions
5. 🛡️ **Security**: Security considerations
6. ⚡ **Performance**: Performance notes
7. 📚 **Best Practices**: Language-specific recommendations

Be specific and provide code examples where helpful.`;
}

// 創建改進建議提示
function createImprovementPrompt(code, requirements) {
    return `You are an expert code reviewer and software architect. Please analyze this code and suggest improvements.

Requirements/Goals: ${requirements}

Code:
\`\`\`
${code}
\`\`\`

Please provide:
1. 🔄 **Refactoring**: Structure and organization improvements
2. ⚡ **Performance**: Optimization opportunities
3. 🛡️ **Security**: Security enhancements
4. 📖 **Readability**: Code clarity improvements
5. 🧪 **Testing**: Testing strategies
6. 🏗️ **Architecture**: Design pattern suggestions
7. 💡 **Modern Features**: Language-specific modern features to use

Provide concrete code examples for your suggestions.`;
}

// 模擬審查結果
function generateMockReview(content, type, focus) {
    const reviews = {
        diff: `## 🔍 Mock Diff Review (${focus} focus)

### ✅ Strengths
- Code follows consistent formatting
- Changes appear to be well-structured

### ⚠️ Issues Found
- Consider adding error handling
- Some functions could benefit from type annotations

### 💡 Suggestions
- Add unit tests for new functionality
- Consider using more descriptive variable names

*This is a mock review. Set CLAUDE_API_KEY for real AI analysis.*`,
        
        file: `## 🔍 Mock File Review

### Overview
This file appears to implement core functionality with standard patterns.

### ✅ Good Practices
- Clean function structure
- Reasonable separation of concerns

### ⚠️ Potential Issues
- Error handling could be improved
- Documentation could be more comprehensive

*This is a mock review. Set CLAUDE_API_KEY for real AI analysis.*`,
        
        improvement: `## 💡 Mock Improvement Suggestions

### 🔄 Refactoring
- Extract common patterns into helper functions
- Consider using design patterns for better organization

### ⚡ Performance
- Look for opportunities to optimize loops
- Consider caching frequently used values

*This is a mock review. Set CLAUDE_API_KEY for real AI analysis.*`
    };
    
    return {
        content: [{
            type: 'text',
            text: reviews[type] || reviews.diff
        }]
    };
}

// 啟動服務器
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('🤖 Claude Code Reviewer MCP server is running...');
}

main().catch((error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});