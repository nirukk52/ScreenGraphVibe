#!/usr/bin/env node
// Minimal AI reviewer router. Reads PR event, detects agent label, fetches diff,
// and posts a routed comment via sg-bot.

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
  process.exit(0);
}

const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
const pr = event.pull_request;
if (!pr) {
  console.log('No pull_request in event; exiting.');
  process.exit(0);
}

const [owner, repo] = (GITHUB_REPOSITORY || '').split('/');
const labels = (pr.labels || []).map((l) => l.name);
let agent = '';
if (labels.includes('agent: Ian')) agent = 'ian';
else if (labels.includes('agent: Rino')) agent = 'rino';
else if (labels.includes('agent: Jacob')) agent = 'jacob';
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
  // Truncated diff fetch for future analysis (not posted)
  const diffRes = await gh(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls/${pr.number}`,
    { headers: { Accept: 'application/vnd.github.v3.diff' } },
  );
  if (!diffRes.ok) {
    console.error('Failed to fetch diff');
  }

  const body = `AI reviewer (sg-bot) for agent: ${agent}\n\n` +
    `Title: ${pr.title}\n\n` +
    `Labels: ${labels.join(', ')}\n\n` +
    `Note: Placeholder routed comment.\n`;
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
  } else {
    console.log('Posted AI review comment');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
