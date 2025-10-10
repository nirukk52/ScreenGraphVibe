/**
 * @module IssueBrancherCLI
 * @description CLI to plan per-issue branches from local changes.
 */

import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { buildPlan } from './planner.js';
import { executePlan } from './executor.js';

function sh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function detectRepo(): { owner: string; repo: string } {
  const remote = sh('git remote get-url origin');
  const m = remote.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (!m) return { owner: 'unknown', repo: 'unknown' };
  return { owner: m[1], repo: m[2] };
}

function fetchOpenIssues(): { number: number; title: string }[] {
  const { owner, repo } = detectRepo();
  try {
    const json = sh(`curl -s https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`);
    const arr = JSON.parse(json);
    return Array.isArray(arr)
      ? arr.filter((x) => typeof x.number === 'number' && typeof x.title === 'string').map((x) => ({ number: x.number, title: x.title }))
      : [];
  } catch {
    return [];
  }
}

function printCommands(plan: ReturnType<typeof buildPlan>): void {
  // eslint-disable-next-line no-console
  console.log('#!/usr/bin/env bash');
  // eslint-disable-next-line no-console
  console.log('set -euo pipefail');
  for (const entry of plan.entries) {
    // eslint-disable-next-line no-console
    console.log(`\n# ${entry.reason}`);
    // eslint-disable-next-line no-console
    console.log(`git switch -c ${entry.branch}`);
    for (const f of entry.files) {
      // eslint-disable-next-line no-console
      console.log(`git add ${f.path}`);
    }
    const msgIssue = entry.existingIssue ? ` (#${entry.existingIssue.number})` : '';
    const commitMsg = `chore: seed ${entry.branch}${msgIssue}`;
    // eslint-disable-next-line no-console
    console.log(`git commit -m ${JSON.stringify(commitMsg)}`);
    // eslint-disable-next-line no-console
    console.log(`git push -u origin ${entry.branch}`);
    if (entry.existingIssue) {
      // eslint-disable-next-line no-console
      console.log(`# Comment on issue #${entry.existingIssue.number}: ${entry.commentBody}`);
    } else if (entry.newIssue) {
      // eslint-disable-next-line no-console
      console.log(`# Create issue: ${entry.newIssue.title} with labels ${entry.newIssue.labels.join(', ')}`);
    }
    // eslint-disable-next-line no-console
    console.log(`git switch ${plan.baseBranch}`);
  }
}

export async function main(): Promise<void> {
  const program = new Command();
  program.name('issue-brancher').description('Plan and print commands to split local changes into per-issue branches').version('1.0.0');

  program
    .command('plan')
    .description('Print JSON plan for current local changes')
    .action(() => {
      const issues = fetchOpenIssues();
      const plan = buildPlan(issues);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(plan, null, 2));
    });

  program
    .command('commands')
    .description('Print a shell script of git commands to execute the plan (no network)')
    .action(() => {
      const issues = fetchOpenIssues();
      const plan = buildPlan(issues);
      printCommands(plan);
    });

  program
    .command('execute')
    .description('Execute the plan: create branches, push, create/comment on issues')
    .option('--token <token>', 'GitHub token (or set GITHUB_TOKEN env)')
    .action(async (opts: { token?: string }) => {
      const token = opts.token ?? process.env.GITHUB_TOKEN;
      if (!token) {
        // eslint-disable-next-line no-console
        console.error('❌ GitHub token required. Set GITHUB_TOKEN env or pass --token');
        process.exit(1);
      }
      const issues = fetchOpenIssues();
      const plan = buildPlan(issues);
      await executePlan(plan, token);
    });

  await program.parseAsync(process.argv);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  void main();
}


