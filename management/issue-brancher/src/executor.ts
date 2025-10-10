/**
 * @module IssueBrancherExecutor
 * @description Executes the plan: creates branches, commits, pushes, creates issues, posts comments.
 * @dependencies Node.js child_process, Octokit (via dynamic import)
 * @publicAPI executePlan
 */

import { execSync } from 'node:child_process';
import type { PlanResult, PlanEntry } from './types.js';

function sh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8', stdio: 'inherit' }).trim();
}

async function createIssue(
  owner: string,
  repo: string,
  spec: { title: string; body: string; labels: string[] },
  token: string
): Promise<number> {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ScreenGraphVibe-IssueBrancher'
    },
    body: JSON.stringify({
      title: spec.title,
      body: spec.body,
      labels: spec.labels
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create issue: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.number;
}

async function commentOnIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  token: string
): Promise<void> {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ScreenGraphVibe-IssueBrancher'
    },
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to comment on issue #${issueNumber}: ${res.status} ${text}`);
  }
}

async function executeEntry(
  entry: PlanEntry,
  baseBranch: string,
  owner: string,
  repo: string,
  token: string
): Promise<void> {
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

  if (entry.newIssue) {
    // eslint-disable-next-line no-console
    console.log(`📝 Creating new issue: ${entry.newIssue.title}`);
    const issueNum = await createIssue(owner, repo, entry.newIssue, token);
    // eslint-disable-next-line no-console
    console.log(`✅ Created issue #${issueNum}`);
    
    // eslint-disable-next-line no-console
    console.log(`💬 Commenting on issue #${issueNum} with branch link...`);
    await commentOnIssue(owner, repo, issueNum, entry.commentBody, token);
  } else if (entry.existingIssue) {
    // eslint-disable-next-line no-console
    console.log(`💬 Commenting on issue #${entry.existingIssue.number}...`);
    await commentOnIssue(owner, repo, entry.existingIssue.number, entry.commentBody, token);
  }

  // eslint-disable-next-line no-console
  console.log(`🔙 Returning to base branch: ${baseBranch}`);
  sh(`git switch ${baseBranch}`);
}

export async function executePlan(plan: PlanResult, token: string): Promise<void> {
  const [owner, repo] = plan.repository.split('/');
  
  // eslint-disable-next-line no-console
  console.log(`\n🎯 Executing plan for ${plan.repository}`);
  // eslint-disable-next-line no-console
  console.log(`📍 Base branch: ${plan.baseBranch}`);
  // eslint-disable-next-line no-console
  console.log(`📋 ${plan.entries.length} branch(es) to create\n`);

  for (const entry of plan.entries) {
    await executeEntry(entry, plan.baseBranch, owner, repo, token);
  }

  // eslint-disable-next-line no-console
  console.log(`\n✨ All done! Created ${plan.entries.length} branch(es) and pushed to GitHub.\n`);
}

