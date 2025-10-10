#!/usr/bin/env node
// Minimal AI reviewer router. Reads PR event, detects agent label, fetches diff,
// calls Copilot MCP review endpoint, and posts a PR comment.

import fs from 'node:fs';
import path from 'node:path';

const {
  GITHUB_EVENT_PATH,
  GITHUB_REPOSITORY,
  GITHUB_API_URL = 'https://api.github.com',
  GITHUB_TOKEN,
  SG_BOT_TOKEN,
} = process.env;

if (!GITHUB_EVENT_PATH || !fs.existsSync(GITHUB_EVENT_PATH)) {
  console.error('GITHUB_EVENT_PATH not found');
  process.exit(1);
}

const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
const pr = event.pull_request;
if (!pr) {
  console.error('No pull_request in event; failing run.');
  process.exit(1);
}

// Validate GITHUB_REPOSITORY format
if (!GITHUB_REPOSITORY || !GITHUB_REPOSITORY.includes('/')) {
  console.error('GITHUB_REPOSITORY must be in format "owner/repo"');
  process.exit(1);
}
const [owner, repo] = GITHUB_REPOSITORY.split('/');
if (!owner || !repo) {
  console.error('GITHUB_REPOSITORY must be in format "owner/repo"');
  process.exit(1);
}
const labels = (pr.labels || []).map((l) => l.name);
let agent = '';
if (labels.includes('agent: Ian')) agent = 'ian';
else if (labels.includes('agent: Rino')) agent = 'rino';
else if (labels.includes('agent: Jacob')) agent = 'jacob';
// Fallback: parse title/body hints
const hint = `${pr.title}\n${pr.body || ''}`.toLowerCase();
if (!agent) {
  if (hint.includes('agent: ian')) agent = 'ian';
  else if (hint.includes('agent: rino')) agent = 'rino';
  else if (hint.includes('agent: jacob')) agent = 'jacob';
}
if (!agent) {
  console.log('No agent label; skipping review.');
  process.exit(0);
}

async function gh(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      ...(init.headers || {}),
    },
  });
  return res;
}

async function main() {
  // Fetch diff (truncate to 300k)
  const diffRes = await gh(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pr.number}`,
    { headers: { Accept: 'application/vnd.github.v3.diff' } },
  );
  if (!diffRes.ok) {
    console.error('Failed to fetch diff');
    process.exit(1);
  }
  let diff = await diffRes.text();
  if (diff.length > 300000) diff = diff.slice(0, 300000);

  // For now: Post a routed summary comment directly using SG_BOT_TOKEN
  const body = `AI reviewer (sg-bot) for agent: ${agent}\n\n` +
    `Title: ${pr.title}\n\n` +
    `Labels: ${labels.join(', ')}\n\n` +
    `Note: Full AI analysis endpoint is not configured; sg-bot is posting a routed placeholder.\n`;
  const commentRes = await gh(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${pr.number}/comments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${SG_BOT_TOKEN}` },
      body: JSON.stringify({ body }),
    },
  );
  if (!commentRes.ok) {
    console.error('Failed to post comment');
    process.exit(1);
  } else {
    console.log('Posted AI review comment');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



