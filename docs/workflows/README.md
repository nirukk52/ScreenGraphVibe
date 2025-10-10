# Workflows

This section documents repository automations and critical development procedures.

## 🚨 Critical Workflows

- **Branch Management** (`BRANCH_MANAGEMENT.md`): **MANDATORY** - AI must check/create feature branch before any code changes

## 🤖 Automated Workflows

- **AI Reviewer** (`AI_REVIEWER.md`): labels/title/body → AI code review posted as PR comment (`.github/workflows/ai-reviewer.yml`, `ci/ai-reviewer.mjs`)
- **PR Delivery Metrics**: appends lead-time and diff stats to `docs/management/DELIVERY_LOG.md` (`.github/workflows/pr-metrics.yml`, `ci/pr-metrics.mjs`)
- **Graphiti Knowledge Graph** (`GRAPHITI_RUNBOOK.md`): Updates project knowledge graph on git push

## Contributing

Contribute new workflows by adding a file under `.github/workflows/` and documenting it here.
