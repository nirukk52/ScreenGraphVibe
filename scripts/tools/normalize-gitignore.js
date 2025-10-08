#!/usr/bin/env node

/**
 * Normalize the repository .gitignore deterministically so multiple agents see clear diffs.
 *
 * Actions performed:
 * - Convert CRLF to LF
 * - Trim trailing whitespace on each line
 * - Collapse multiple blank lines to a single blank line
 * - Deduplicate non-comment lines while preserving first occurrence order
 * - Ensure file ends with a single trailing newline
 */

const fs = require('fs');
const path = require('path');

function normalizeGitignore(inputText) {
  // Normalize line endings to LF
  const withLf = inputText.replace(/\r\n/g, '\n');

  const lines = withLf.split('\n');
  const seen = new Set();
  const result = [];

  let lastWasBlank = false;

  for (const rawLine of lines) {
    // Remove trailing whitespace but preserve leading whitespace (rare in .gitignore but harmless to keep)
    const line = rawLine.replace(/[\t\x20]+$/u, '');
    const trimmed = line.trim();

    const isBlank = trimmed.length === 0;
    if (isBlank) {
      if (!lastWasBlank && result.length > 0) {
        result.push('');
      }
      lastWasBlank = true;
      continue;
    }

    lastWasBlank = false;

    // Preserve comments without deduplication to avoid removing intentional repeated notes
    const isComment = trimmed.startsWith('#');
    if (!isComment) {
      if (seen.has(line)) {
        continue; // skip duplicates of non-comment lines
      }
      seen.add(line);
    }

    result.push(line);
  }

  // Ensure single trailing newline
  return result.join('\n') + '\n';
}

function run() {
  const repoRoot = process.cwd();
  const gitignorePath = path.join(repoRoot, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    console.log('.gitignore not found, nothing to normalize');
    process.exit(0);
  }

  const original = fs.readFileSync(gitignorePath, 'utf8');
  const normalized = normalizeGitignore(original);

  if (normalized !== original) {
    fs.writeFileSync(gitignorePath, normalized, 'utf8');
    console.log('UPDATED .gitignore');
    process.exit(0);
  } else {
    console.log('NOCHANGE .gitignore');
    process.exit(0);
  }
}

run();


