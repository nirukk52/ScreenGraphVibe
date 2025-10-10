# ADR-20251010-graphiti-management-module

Date: 2025-10-10

## Context

Graphiti MCP connectivity is intermittently unavailable. We need a resilient management module that retries every 30 seconds up to 4 times, triggers a light recovery action, and cools down before repeating, without disabling Graphiti.

## Options

A. Ad-hoc retries scattered across features

B. Centralized manager module with CLI and documented policy

C. External process health check only (no in-repo management)

## Pros/Cons

- A Pros: Quick to add where needed. Cons: Duplication, inconsistency, harder maintenance.
- B Pros: Single responsibility, consistent policy, testable, scriptable. Cons: Initial work to create and wire.
- C Pros: Operational separation. Cons: Lacks app-level hooks and dev ergonomics.

## Decision

Choose B. Implement `GraphitiManager` in `docs/src/graphiti/manager.ts` with:
- maxAttempts=4, intervalSeconds=30, coolDownMsAfterMax=120000
- best-effort recovery by writing `docs/.graphiti/ping.json`
- CLI in `docs/src/graphiti/cli.ts` with `monitor` and `status`

## Rationale

1. Matches non-negotiable rules: SRP, clear boundaries, documented policy.
2. Centralizes retry semantics for consistent behavior across modules.
3. Adds CLI to integrate with scripts and developer workflows.

## Impact

- :docs adds manager + CLI and ADR.
- :mcp prompt fixed to correct graph id and role node.
- No changes to :backend/:ui/:data required.

## Next Steps

1. Wire real MCP checks in place of simulated ones.
2. Add minimal unit tests in :docs for manager logic.
3. Consider OS notifications when max retries reached.
4. Track connectivity metrics in memory for observability.


