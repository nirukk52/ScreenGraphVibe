# Workflow: AI Reviewer on PR Labels

Purpose: Route PR diffs to an AI reviewer based on labels: `agent: Ian`, `agent: Rino`, or `agent: Jacob`. Post the response as a PR comment.

## Trigger
- Events: `pull_request` (opened, synchronize, reopened, labeled)

## Labels → Agent
- `agent: Ian` → CTO/architecture guidance
- `agent: Rino` → implementation & cleanup
- `agent: Jacob` → backend engineering focus

## Secrets
- `SG_BOT_TOKEN`: token for posting as bot commenter (used for everything)

## Env in workflow
```yaml
env:
  GITHUB_COPILOT_TOKEN: ${{ secrets.GITHUB_COPILOT_TOKEN }}
  SG_BOT_TOKEN: ${{ secrets.SG_BOT_TOKEN }}
```

## Flow
1) Validate GITHUB_REPOSITORY format (must be "owner/repo")
2) Detect agent label on the PR
3) Fetch PR diff (truncated for size)
4) Post a routed agent-specific comment via sg-bot (placeholder until analysis endpoint is configured)
5) Include Episode-ID in the PR description when available

## Error Handling
- Script exits with code 1 if GITHUB_EVENT_PATH is missing
- Script exits with code 1 if GITHUB_REPOSITORY is malformed (not "owner/repo" format)
- Script exits with code 1 if GitHub API calls fail (diff fetch, comment post)
- All failures are logged with clear error messages

File: `.github/workflows/ai-reviewer.yml`

Notes:
- Keep credentials only in GitHub Secrets. Do NOT commit tokens into `.cursor/mcp.json`.
- Each PR description should link the Graphiti Episode once recorded.
