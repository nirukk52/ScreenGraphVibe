/**
 * @module IssueBrancherPlanner
 * @description Builds a plan grouping current uncommitted changes into per-issue branches.
 * @dependencies Node.js child_process
 * @publicAPI buildPlan
 */

import { execSync } from 'node:child_process';
import type { FileChange, PlanEntry, PlanResult } from './types.js';

function sh(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function listStaged(): string[] {
  const out = sh('git diff --name-only --cached || true');
  return out ? out.split('\n').filter(Boolean) : [];
}

function listUntracked(): string[] {
  const out = sh('git ls-files --others --exclude-standard || true');
  return out ? out.split('\n').filter(Boolean) : [];
}

function detectRepo(): string {
  const remote = sh('git remote get-url origin');
  const m = remote.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (!m) return 'unknown/unknown';
  return `${m[1]}/${m[2]}`;
}

function currentBranch(): string {
  return sh('git branch --show-current');
}

function toFileChanges(paths: string[], status: 'staged' | 'untracked'): FileChange[] {
  return paths.map((p) => ({ path: p, status }));
}

function suggestBranchName(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}`;
}

export function buildPlan(openIssues: { number: number; title: string }[]): PlanResult {
  const baseBranch = currentBranch();
  const repository = detectRepo();

  const staged = toFileChanges(listStaged(), 'staged');
  const untracked = toFileChanges(listUntracked(), 'untracked');
  const all = [...staged, ...untracked];

  const entries: PlanEntry[] = [];

  const docsIdx = all.filter((f) => f.path.startsWith('docs/'));
  const ciFiles = all.filter((f) => f.path.startsWith('.github/') || f.path.startsWith('ci/'));
  const mgmtFiles = all.filter((f) => f.path.startsWith('management/'));
  const backendGraph = all.filter((f) => f.path.startsWith('backend/src/features/graph/') || f.path === 'backend/src/features/core/graph-events.types.ts' || f.path === 'backend/src/features/core/tests/graph.sse.integration.test.ts');
  const uiGraph = all.filter((f) => f.path.startsWith('ui/src/features/screen/graph/'));
  const stray = all.filter((f) => f.path.startsWith('`https:'));

  const used = new Set<string>();
  function take(files: FileChange[]): FileChange[] {
    return files.filter((f) => {
      if (used.has(f.path)) return false;
      used.add(f.path);
      return true;
    });
  }

  if (docsIdx.length) {
    const iss = openIssues.find((i) => i.number === 17);
    const files = take(docsIdx);
    if (files.length) {
      entries.push({
        branch: suggestBranchName('feature/docs-index-update-adr-disposition'),
        files,
        reason: 'Documentation index updates mapped to ADR disposition task',
        existingIssue: iss ? { number: iss.number, title: iss.title } : undefined,
        newIssue: iss ? undefined : {
          title: 'Document ADR disposition for uncommitted changes',
          body: 'Add/update docs/DOCUMENT_INDEX.md to reflect ADR decisions for uncommitted changes.',
          labels: ['agent: Ian', 'component: docs']
        },
        commentBody: 'Proposed branch includes docs index updates for ADR disposition.'
      });
    }
  }

  if (ciFiles.length) {
    const files = take(ciFiles);
    if (files.length) {
      const issue20 = openIssues.find((i) => i.number === 20);
      entries.push({
        branch: suggestBranchName('feature/ci-ai-reviewer-and-metrics-setup'),
        files,
        reason: 'Set up CI helpers and reviewer/assignment workflows',
        existingIssue: issue20 ? { number: issue20.number, title: issue20.title } : undefined,
        commentBody: 'Proposed branch includes .github/workflows and ci/* updates for reviewer/metrics.'
      });
    }
  }

  if (mgmtFiles.length) {
    const files = take(mgmtFiles);
    if (files.length) {
      const issue21 = openIssues.find((i) => i.number === 21);
      entries.push({
        branch: suggestBranchName('feature/management-module-bootstrap-and-docs'),
        files,
        reason: 'Introduce management module and docs',
        existingIssue: issue21 ? { number: issue21.number, title: issue21.title } : undefined,
        commentBody: 'Proposed branch includes management module files and docs.'
      });
    }
  }

  if (backendGraph.length || uiGraph.length) {
    const files = take([...backendGraph, ...uiGraph]);
    if (files.length) {
      entries.push({
        branch: suggestBranchName('feature/graph-sse-events-mock-stream'),
        files,
        reason: 'Add SSE types, ports, adapters, integration tests, and UI hook.',
        newIssue: {
          title: 'Graph SSE event types, ports, and mock stream',
          body: 'Add SSE event types and plumbing in backend with mock stream and UI hook to consume events; include integration test.',
          labels: ['agent: Ian', 'component: backend', 'component: ui']
        },
        commentBody: 'Proposed branch implements graph SSE event plumbing and UI hook.'
      });
    }
  }

  if (stray.length) {
    const files = take(stray);
    if (files.length) {
      entries.push({
        branch: suggestBranchName('chore/remove-stray-https-path-artifact'),
        files,
        reason: 'Delete accidental path artifact file.',
        newIssue: {
          title: 'Remove stray path artifact file',
          body: 'Delete accidental `https:` path artifact committed locally.',
          labels: ['type: chore']
        },
        commentBody: 'Proposed branch removes the stray artifact file.'
      });
    }
  }

  return { baseBranch, repository, entries };
}


