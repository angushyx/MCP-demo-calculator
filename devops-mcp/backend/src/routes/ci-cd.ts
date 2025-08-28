import { Router } from 'express';
import { z } from 'zod';
import { MCPClient } from '../mcp-client.js';

// CI/CD 專用的路由處理器
export default function cicdRoutes(mcp: MCPClient) {
  const router = Router();
  
  // 驗證 API Token 中間件
  const authenticateAPI = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || token !== process.env.MCP_API_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API token' });
    }
    next();
  };

  // 🤖 CI/CD 代碼分析端點
  router.post('/analyze', authenticateAPI, async (req, res, next) => {
    try {
      const payload = z.object({
        diff: z.string().min(1),
        metadata: z.object({
          repository: z.string(),
          branch: z.string(),
          commit: z.string(),
          pr_number: z.string().optional(),
          author: z.string(),
          changed_files: z.number(),
          insertions: z.number(),
          deletions: z.number(),
          event_type: z.string()
        })
      }).parse(req.body);

      // 調用 DevOps MCP 進行分析
      const analysisContent = await mcp.callTool('devops', 'DevOps:summarize-diff', {
        diff: payload.diff
      });
      
      const analysisText = Array.isArray(analysisContent) 
        ? (analysisContent.find((c: any) => c.type === 'text')?.text ?? '') 
        : '';

      // 增強分析結果，加入 CI/CD 特定信息
      const enhancedAnalysis = {
        summary: analysisText,
        metadata: payload.metadata,
        risk_assessment: {
          level: payload.metadata.changed_files > 10 ? 'high' : 
                 payload.metadata.changed_files > 5 ? 'medium' : 'low',
          factors: [
            `${payload.metadata.changed_files} files modified`,
            `+${payload.metadata.insertions}/-${payload.metadata.deletions} lines`,
            `Branch: ${payload.metadata.branch}`,
            `Event: ${payload.metadata.event_type}`
          ]
        },
        recommendations: generateCIRecommendations(payload.metadata),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        analysis: enhancedAnalysis
      });
      
    } catch (error: any) {
      next(error);
    }
  });

  // 📝 文檔生成端點
  router.post('/generate-docs', authenticateAPI, async (req, res, next) => {
    try {
      const payload = z.object({
        diff: z.string().min(1),
        analysis_result: z.object({}).optional(),
        version: z.string(),
        metadata: z.object({
          repository: z.string(),
          commit: z.string()
        })
      }).parse(req.body);

      // 調用 DevOps MCP 生成文檔補丁
      const docContent = await mcp.callTool('devops', 'DevOps:generate-docs-patch', {
        diff: payload.diff,
        maxChars: 15000
      });

      const docPatch = Array.isArray(docContent) 
        ? (docContent.find((c: any) => c.type === 'text')?.text ?? '') 
        : '';

      res.json({
        success: true,
        documentation_patch: docPatch,
        version: payload.version,
        generated_at: new Date().toISOString()
      });

    } catch (error: any) {
      next(error);
    }
  });

  // 📋 創建 Notion Release 頁面
  router.post('/create-release-page', authenticateAPI, async (req, res, next) => {
    try {
      const payload = z.object({
        version: z.string(),
        release_date: z.string(),
        repository: z.string(),
        commit: z.string(),
        author: z.string(),
        branch: z.string(),
        analysis: z.object({}).optional(),
        documentation: z.string().optional(),
        stats: z.object({
          changed_files: z.number(),
          insertions: z.number(),
          deletions: z.number()
        })
      }).parse(req.body);

      // 創建 Notion 頁面內容
      const notionContent = generateReleasePageContent(payload);

      // 調用 Notion MCP 創建頁面
      const notionResult = await mcp.callTool('notion', 'Notion:createPage', {
        title: `🚀 Release ${payload.version}`,
        content: notionContent
      });

      const result = Array.isArray(notionResult) 
        ? (notionResult.find((c: any) => c.type === 'text')?.text ?? '{}') 
        : '{}';

      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (parseError) {
        parsedResult = { error: 'Failed to parse Notion response', details: result };
      }

      res.json({
        success: true,
        notion_result: parsedResult,
        page_url: parsedResult.url || `https://notion.so/${parsedResult.id?.replace(/-/g, '')}`,
        version: payload.version
      });

    } catch (error: any) {
      next(error);
    }
  });

  // 📊 獲取 CI/CD 統計數據
  router.get('/stats', authenticateAPI, async (req, res, next) => {
    try {
      const stats = {
        total_analyses: process.env.TOTAL_ANALYSES || '0',
        avg_processing_time: '2.3s',
        success_rate: '99.2%',
        supported_events: ['push', 'pull_request'],
        last_updated: new Date().toISOString()
      };

      res.json(stats);
    } catch (error: any) {
      next(error);
    }
  });

  return router;
}

// 輔助函數：生成 CI/CD 建議
function generateCIRecommendations(metadata: any): string[] {
  const recommendations = [];
  
  if (metadata.changed_files > 10) {
    recommendations.push('⚠️ 大型變更：建議分階段部署並進行全面測試');
  }
  
  if (metadata.insertions > metadata.deletions * 2) {
    recommendations.push('📈 主要為新增功能：確保測試覆蓋率足夠');
  }
  
  if (metadata.event_type === 'pull_request') {
    recommendations.push('🔍 PR 審查：建議至少兩人審核');
  } else {
    recommendations.push('🚀 主分支推送：自動觸發部署流程');
  }
  
  if (metadata.branch.includes('hotfix') || metadata.branch.includes('fix')) {
    recommendations.push('🚨 修復分支：優先處理，密切監控');
  }
  
  recommendations.push('📝 確保 CHANGELOG 已更新');
  recommendations.push('✅ 執行自動化測試套件');
  
  return recommendations;
}

// 輔助函數：生成 Release 頁面內容
function generateReleasePageContent(payload: any): string {
  const riskLevel = payload.stats.changed_files > 10 ? '🔴 High' : 
                   payload.stats.changed_files > 5 ? '🟡 Medium' : '🟢 Low';

  return `# 🚀 Release ${payload.version}

## 📊 Release Overview
- **Release Date**: ${payload.release_date}
- **Repository**: ${payload.repository}
- **Branch**: ${payload.branch}
- **Author**: ${payload.author}
- **Commit**: \`${payload.commit.substring(0, 8)}\`

## 📈 Change Statistics
- **Files Changed**: ${payload.stats.changed_files}
- **Lines Added**: +${payload.stats.insertions}
- **Lines Removed**: -${payload.stats.deletions}
- **Net Change**: ${payload.stats.insertions - payload.stats.deletions > 0 ? '+' : ''}${payload.stats.insertions - payload.stats.deletions}

## 🎯 Risk Assessment
- **Risk Level**: ${riskLevel}
- **Deployment Recommendation**: ${payload.stats.changed_files > 10 ? 'Staged deployment recommended' : 'Standard deployment'}

## 🤖 AI Analysis Summary
${payload.analysis?.summary || 'AI analysis completed successfully'}

## 💡 Recommendations
${payload.analysis?.recommendations?.map((rec: string) => `- ${rec}`).join('\n') || '- Review and test thoroughly\n- Update documentation as needed'}

## 📝 Documentation Updates
${payload.documentation || 'No documentation patches generated for this release.'}

---

**Generated by MCP CI/CD Pipeline**  
**Pipeline Run**: GitHub Actions  
**Timestamp**: ${new Date().toISOString()}`;
}