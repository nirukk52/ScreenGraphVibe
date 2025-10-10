/**
 * @module IssueBrancherTypes
 * @description Types for planning split of uncommitted changes into per-issue branches.
 * @publicAPI FileChange, ExistingIssueRef, NewIssueSpec, PlanEntry, PlanResult
 */

export interface FileChange {
  path: string;
  status: 'staged' | 'untracked';
}

export interface ExistingIssueRef {
  number: number;
  title: string;
}

export interface NewIssueSpec {
  title: string;
  body: string;
  labels: string[];
}

export interface PlanEntry {
  branch: string;
  files: FileChange[];
  reason: string;
  existingIssue?: ExistingIssueRef;
  newIssue?: NewIssueSpec;
  commentBody: string;
}

export interface PlanResult {
  baseBranch: string;
  repository: string; // owner/repo
  entries: PlanEntry[];
}


