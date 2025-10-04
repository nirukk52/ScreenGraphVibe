# CLAUDE.md

## ScreenGraph CLAUDE Configuration

ScreenGraph is an AI‑driven crawling and verification system. It automatically explores mobile and web apps, captures their UI states and actions as structured graphs (Screengraphs) and compares them against baselines. The system combines Appium for device control, LangGraph for agent orchestration and Node.js tooling to enable autonomous crawling, testing and visualisation of app behaviour end‑to‑end. This file provides guidance to Claude Code when working with this repository.

---

## Development will be done step by step.

## Technology Stack

ScreenGraph is intentionally polyglot but unified by a single Postgres database. To stay organised, all modules are declared using colon‑prefixed labels:

| Module   | Language/Frameworks | Purpose |
|----------|----------------------|---------|
| **:data** | Drizzle (TypeScript), Postgres, Supabase | Owns the schema, migrations and RLS policies. Provides the source of truth tables for runs, screens, actions, baselines and jobs. Coordinates crawling and verification. Exposes REST APIs. |
| **:agent** | Node.js, Fastify, LangGraph JS, Appium JS, BullMQ + Redis | Exposes REST APIs (`/healthz`, `/crawl`, `/status/{runId}`, `/graph/{runId}`), coordinates crawls, writes to DB, queues jobs. |
| **:ui** | Next.js (React/TypeScript), Tailwind CSS | Renders Screengraphs and diff views. Calls the agent API (never DB). Uses React Flow (or similar) for visualisation. |
| **:tests** | Vitest, Playwright, Testcontainers, openapi‑typescript | Implements unit, integration, and end‑to‑end tests. Includes “god test” that drives Appium, runs crawls, checks graphs vs baselines. |
| **:logging** | Pino, OpenTelemetry | Provides structured logging and distributed tracing across all services. |

---

## Key principle
- Mocks are a last resort. Use them to isolate external systems or non-deterministic functions, but always bias toward real data, real infra, real flows.
- Use mocks only at boundaries you don’t control
 - External APIs, third-party SDKs, cloud services.
 - Everything else (DB, queues, files, UI) should run with real instances in tests.
 - Prefer ephemeral real infrastructure
 - Use Testcontainers for Postgres, Redis, S3, etc.
 - This ensures your integration tests run on the same tech as production.

## Architecture & Ownership

### Data module (:data)
- Single source of truth: Supabase Postgres instance.
- Minimal schema: runs, screens, actions, baselines, jobs.
- Each table has its own migration (Drizzle), rollback required.
- RLS policies to isolate tenants, but UI reads always via agent.

### Agent module (:agent)
- Only service that reads/writes DB.
- Exposes Fastify REST API with OpenAPI spec.
- Use BullMQ for queues, LangGraph for orchestration.
- God test drives Appium → triggers crawl → polls `/status/{runId}`.
- Logging: Pino + OpenTelemetry spans with trace IDs.

### UI module (:ui)
- Read-only, calls agent for data.
- Visualises graphs (React Flow / Cytoscape).
- Diff views for actual vs expected.
- Uses React Query/SWR, openapi‑typescript generated types.
- Validates with Zod.
- Testing via Vitest, RTL, Playwright.

---

## Coding Guidelines

1. **Interfaces first** – define TS interfaces/types before implementation.
2. **Modular code** – small, single‑responsibility modules.
3. **Constants everywhere** – centralised in `src/config/constants.ts`.
4. **Size limits** – ≤100 lines per function, ≤600 per class.
5. **Batch & parallelism** – group operations, no sequential message chains.
6. **Minimal files** – prefer editing existing ones.
7. **TDD** – failing test before code; god test for full crawl/baseline check.
8. **Self‑management** – batch feature work (route, UI, test, docs) in one update.

---

## Execution Patterns

- **Batch ops**: install deps + config + tests in one step.
- **Parallel testing**: Vitest + Playwright concurrency.
- **Self‑coordinated batches**: solo dev → one cohesive update per feature.
- **Minimal file creation**: extend existing files when possible.

---

## Logging & Telemetry

- LangGraph telemetry for internal agent transitions.
- OpenTelemetry spans for requests and jobs.
- Structured JSON logs via Pino with run_id, job_id, user_id.
- No sensitive data in logs.

---

## File & Directory Operations

- Always check CLAUDE‑activeContext.md and patterns before tasks.
CLAUDE-activeContext.md - Current session state, goals, and progress (if exists)
CLAUDE-patterns.md - Established code patterns and conventions (if exists)
CLAUDE-decisions.md - Architecture decisions and rationale (if exists)
CLAUDE-troubleshooting.md - Common issues and proven solutions (if exists)
CLAUDE-config-variables.md - Configuration variables reference (if exists)
- Avoid creating new files unless necessary.
- Use fast CLI tools (fd, rg).
- Constants defined in `src/config/constants.ts`.

---

## Database Tables (Minimal)

1. **runs** – id, start_time, schema_version, status, baseline_id, user_id.
2. **screens** – run_id, screen_id, name, payload, created_at.
3. **actions** – action_id, screen_id, type, payload, target_screen_id, created_at.
4. **baselines** – baseline_id, app_id, platform, version, graph_json, created_at.
5. **jobs** – job_id, run_id, package_name, status, enqueued_at, started_at, finished_at, error_message.

---

## E2E & Baseline Verification

- **Graph equality** – ignore timestamps, dynamic IDs; use thresholds.
- **Baseline editing** – controlled inputs, versioning, audit trail.
- **God test** – CLI/test util with Appium → crawl → compare to baseline. Runs in CI with Testcontainers.

---

## Using This CLAUDE.md

- Always reference this file before tasks.
- Do not modify unless explicitly instructed.
- Group related file edits/CLI commands in one batched message.

---

### References
1. [CLAUDE MD JavaScript · ruvnet/claude-flow Wiki](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-JavaScript)  
2. [CLAUDE MD Solo · ruvnet/claude-flow Wiki](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Solo)  
3. [My Claude Code Setup](https://raw.githubusercontent.com/centminmod/my-claude-code-setup/master/CLAUDE.md)  
