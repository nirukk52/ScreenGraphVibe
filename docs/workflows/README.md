# Workflows

This section documents repository automations and critical development procedures.

## 🚨 Critical Workflows

- **Branch Management** (`BRANCH_MANAGEMENT.md`): **MANDATORY** - AI must check/create feature branch before any code changes

## 🤖 Automated Workflows

- **AI Reviewer** (`AI_REVIEWER.md`): labels/title/body → AI code review posted as PR comment (`.github/workflows/ai-reviewer.yml`, `ci/ai-reviewer.mjs`)
- **PR Delivery Metrics**: appends lead-time and diff stats to `docs/management/DELIVERY_LOG.md` (`.github/workflows/pr-metrics.yml`, `ci/pr-metrics.mjs`)
- **Graphiti Knowledge Graph** (`GRAPHITI_RUNBOOK.md`): Updates project knowledge graph on git push
- **Issue Auto-Unblocking** (`ISSUE_CREATION.md`): On PR merge or issue close, detect resolved dependencies and auto-mark dependent issues as ready; notifies assignees (`.github/workflows/unblock-issues.yml`).

## 🧾 Issue Creation & Relationships (Native GitHub)

- Use GitHub's sidebar "Relationships" to set "Blocked by" / "Blocks"; prefer native links over body text.
- Create issues with labels: `status: blocked|ready`, `phase: 1-blocking|2-parallel|3-closure`, and agent label (`agent: Ian|Rino|Jacob`).
- See full procedure: `docs/workflows/ISSUE_CREATION.md`.

## Error Handling Standards

All CI scripts follow these reliability standards:
- Validate environment variables (GITHUB_EVENT_PATH, GITHUB_REPOSITORY format)
- Exit with code 1 on validation failures or API errors
- Provide clear error messages for debugging
- Fail fast and visibly to prevent silent workflow failures

## Contributing

Contribute new workflows by adding a file under `.github/workflows/` and documenting it here.
