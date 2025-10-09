# MCP Clean Architecture and Naming Guidelines

## Purpose
Define a simple, non-duplicative structure for `.mcp/` that scales, enforces consistency, and supports mention-style orchestration (e.g., "Hey @Ian @listen to this @they …").

## Folders
- `personas/` — People or roles with behavior and guard rails.
- `prompts/` — Executable briefs and orchestrations.
- `aliases/` — Routing maps from mentions (e.g., `@Ian`) to concrete persona/prompt ids.
- `templates/` — Reusable text/spec templates (optional).

## Principles
- Single responsibility per file; avoid duplication by composing (e.g., `ian_improved` extends `cto_ian_bott` + memory optimizer).
- Deterministic model settings guard in all executable prompts/personas.
- Graphiti-first: run BEFORE_TASK; on failure, stop with the exact failure line.
- Files named as complete words/sentences for immediate invocation clarity.

## Conventions
- File naming: prefer human-readable sentences with spaces, e.g., `Message with mentions orchestration.json`.
- `prompt_id`/`persona_id` are machine-stable (e.g., `@listen_to_this`, `ian_improved`).
- All prompts include: `model_settings_assert`, `graphiti_protocol.before_task`, redact policy.
- Orchestrators parse mentions using `aliases/` routing, then run referenced prompts/personas.

## Auto-Discovery of Mentions
- Aliases-first precedence: check `.mcp/aliases/Mentions to prompts and personas routing.json`.
- If not found and discovery is enabled, auto-resolve `@<id>` by scanning `.mcp/personas/` and `.mcp/prompts/` (normalize: strip `@`, lowercase, spaces→underscores).
- Special multi-word handles (e.g., `@listen to this`) should remain in aliases for clarity.

## Mentions Examples
- "Hey @Ian @listen to this @they are wondering what should we do in → <my question>"
- Mentions resolve via `aliases/Mentions to prompts and personas routing.json`.

## Cross-Module Awareness
All outputs should highlight impact across `:data`, `:backend`, `:ui`, `:agent`, `:infra` when relevant.

## Determinism and Safety
- Enforce exact model settings; on mismatch print `Model settings mismatch` and stop.
- Redact secrets/PII as `[REDACTED]`.

## Graph exploration (Neo4j/Cypher examples)
- Ian (CTO) — recent decisions and edges
```cypher
// ADR episodes authored by Ian Bott (CTO)
MATCH (i:Person {name: "Ian Bott (CTO)"})-[:DECIDES]->(a:ADR)
RETURN a.id AS adr_id, a.title AS title, a.date AS date
ORDER BY a.date DESC LIMIT 25;

// Module relations for Ian's ADRs
MATCH (i:Person {name: "Ian Bott (CTO)"})-[:DECIDES]->(a:ADR)-[:RELATES_TO_MODULE]->(m:Module)
RETURN a.id AS adr_id, m.name AS module
ORDER BY adr_id;

// Supersedes graph
MATCH (i:Person {name: "Ian Bott (CTO)"})-[:DECIDES]->(a:ADR)-[:SUPERSedes]->(old:ADR)
RETURN a.id AS adr_id, old.id AS supersedes
ORDER BY a.date DESC;
```

- Rino (Engineer) — work activity snapshot
```cypher
// Commits and PRs attributed to Rino (if modeled)
MATCH (r:Person {name: "Rino (Engineer)"})-[:AUTHORED]->(c:Change)
RETURN c.id AS change_id, c.type AS kind, c.date AS date, c.summary AS summary
ORDER BY c.date DESC LIMIT 50;

// Episodes created by Rino
MATCH (r:Person {name: "Rino (Engineer)"})-[:CREATED]->(e:Episode)
RETURN e.id AS episode_id, e.tags AS tags, e.date AS date
ORDER BY e.date DESC LIMIT 25;
```
