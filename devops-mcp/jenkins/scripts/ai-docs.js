import { execSync, spawn } from 'child_process';
import fs from 'fs';

const BASE_REF = process.env.BASE_REF || 'origin/main';
const AI_CLI = process.env.AI_CLI || 'claude-code';
const MAX_CHARS = parseInt(process.env.MAX_CHARS || '12000', 10);

const rawDiff = execSync(
  `git diff ${BASE_REF}...HEAD --unified=0 -- . ':(exclude)package-lock.json' ':(exclude)pnpm-lock.yaml'`, 
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);

const blocks = rawDiff.split(/\n(?=diff --git )/g).filter(Boolean);

const promptOf = (chunk) => `You are a senior code/documentation assistant.

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
${chunk}`.trim();

function runCli(prompt) {
  return new Promise((resolve, reject) => {
    const p = spawn(AI_CLI, [], { stdio: ['pipe', 'pipe', 'inherit'] });
    let out = '';
    p.stdout.on('data', d => out += d.toString());
    p.on('close', c => c === 0 ? resolve(out.trim()) : reject(new Error(`LLM exit ${c}`)));
    p.stdin.write(prompt);
    p.stdin.end();
  });
}

(async () => {
  let agg = '';
  for (const b of blocks) {
    const ans = await runCli(promptOf(b.slice(0, MAX_CHARS)));
    if (ans && /(^(diff --git)|^--- |^\+\+\+ |^@@ )/m.test(ans)) {
      agg += ans + '\n';
    }
  }
  fs.writeFileSync('ai.patch', agg.trim(), 'utf8');
  console.log(agg ? 'ai.patch generated' : 'No AI patch produced');
})();
