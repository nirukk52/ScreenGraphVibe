/**
 * @module IssueBrancherExecutorMCP
 * @description Executes plan using direct git commands and returns instructions for GitHub API calls.
 * @dependencies Node.js child_process
 * @publicAPI executePlanLocal, GitHubAction
 */

import { execSync } from 'node:child_process';
import type { PlanResult, PlanEntry } from './types.js';

function sh(cmd: string): void {
  execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
}

export interface GitHubAction {
  type: 'create_issue' | 'comment_issue';
  issueNumber?: number;
  title?: string;
  body: string;
  labels?: string[];
}

export interface ExecutionResult {
  branchesCreated: string[];
  githubActions: Array<GitHubAction & { branch: string }>;
}

function executeEntryLocal(entry: PlanEntry, baseBranch: string): GitHubAction | null {
  // eslint-disable-next-line no-console
  console.log(`\n🌿 Creating branch: ${entry.branch}`);
  sh(`git switch -c ${entry.branch}`);

  // eslint-disable-next-line no-console
  console.log(`📦 Adding ${entry.files.length} file(s)...`);
  for (const f of entry.files) {
    sh(`git add "${f.path}"`);
  }

  const commitMsg = entry.existingIssue
    ? `chore: seed ${entry.branch} (#${entry.existingIssue.number})`
    : `chore: seed ${entry.branch}`;
  
  // eslint-disable-next-line no-console
  console.log(`💾 Committing: ${commitMsg}`);
  sh(`git commit -m "${commitMsg}"`);

  // eslint-disable-next-line no-console
  console.log(`🚀 Pushing to origin...`);
  sh(`git push -u origin ${entry.branch}`);

  // eslint-disable-next-line no-console
  console.log(`🔙 Returning to base branch: ${baseBranch}`);
  sh(`git switch ${baseBranch}`);

  if (entry.newIssue) {
    return {
      type: 'create_issue',
      title: entry.newIssue.title,
      body: entry.newIssue.body + `\n\n**Branch**: \`${entry.branch}\``,
      labels: entry.newIssue.labels
    };
  } else if (entry.existingIssue) {
    return {
      type: 'comment_issue',
      issueNumber: entry.existingIssue.number,
      body: entry.commentBody + `\n\n**Branch**: \`${entry.branch}\``
    };
  }

  return null;
}

export function executePlanLocal(plan: PlanResult): ExecutionResult {
  // eslint-disable-next-line no-console
  console.log(`\n🎯 Executing plan for ${plan.repository}`);
  // eslint-disable-next-line no-console
  console.log(`📍 Base branch: ${plan.baseBranch}`);
  // eslint-disable-next-line no-console
  console.log(`📋 ${plan.entries.length} branch(es) to create\n`);

  const branchesCreated: string[] = [];
  const githubActions: Array<GitHubAction & { branch: string }> = [];

  for (const entry of plan.entries) {
    const action = executeEntryLocal(entry, plan.baseBranch);
    branchesCreated.push(entry.branch);
    
    if (action) {
      githubActions.push({ ...action, branch: entry.branch });
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n✨ Created ${branchesCreated.length} branch(es) and pushed to GitHub.\n`);

  return { branchesCreated, githubActions };
}

