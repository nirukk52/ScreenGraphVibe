#!/usr/bin/env node
// Append delivery metrics to docs/management/DELIVERY_LOG.md on PR merge
import fs from 'node:fs';
import path from 'node:path';

const { GITHUB_EVENT_PATH } = process.env;
if (!GITHUB_EVENT_PATH || !fs.existsSync(GITHUB_EVENT_PATH)) {
  console.error('GITHUB_EVENT_PATH not found');
  process.exit(0);
}

const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
const pr = event.pull_request;
if (!pr || !pr.merged) {
  console.log('No merged PR in event; exiting.');
  process.exit(0);
}

const created = new Date(pr.created_at);
const merged = new Date(pr.merged_at);
const hours = Math.max(0, (merged - created) / 36e5).toFixed(2);
const labels = (pr.labels || []).map((l) => l.name).join(', ');
const agent = (pr.labels || [])
  .map((l) => l.name)
  .find((n) => n.startsWith('agent:')) || 'agent: none';

const pdir = path.join(process.cwd(), 'docs/management');
const p = path.join(pdir, 'DELIVERY_LOG.md');
if (!fs.existsSync(pdir)) fs.mkdirSync(pdir, { recursive: true });
if (!fs.existsSync(p)) {
  fs.writeFileSync(
    p,
    '# Delivery Log\n\n| PR | Author | Agent | Lead Time | Labels | Diff | Title |\n|---|---|---|---:|---|---|---|\n',
    'utf8',
  );
}
const entry = `| #${pr.number} | ${pr.user.login} | ${agent} | ${hours}h | ${labels} | ${pr.additions}+ / ${pr.deletions}- | ${pr.title} |\n`;
fs.appendFileSync(p, entry, 'utf8');
console.log('Appended delivery log entry');
