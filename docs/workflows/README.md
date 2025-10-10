# Workflows

This section documents repository automations.

- AI Reviewer: labels/title/body → AI code review posted as PR comment (`.github/workflows/ai-reviewer.yml`, `ci/ai-reviewer.mjs`)
- PR Delivery Metrics: appends lead-time and diff stats to `docs/management/DELIVERY_LOG.md` (`.github/workflows/pr-metrics.yml`, `ci/pr-metrics.mjs`)

Contribute new workflows by adding a file under `.github/workflows/` and documenting it here.
