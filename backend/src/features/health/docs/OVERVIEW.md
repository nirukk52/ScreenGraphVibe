# health (feature)

Purpose: top-level executable and docs for the health feature.

- Executable: `features/health/exec/main.ts` (CLI) prints deterministic JSON with fixed `trace_id`.
- Mock mode: controlled via `MOCK_FEATURES` (`health` applies to all sub-features).
- Sub-features: `check`.

Run:
```bash
node dist/src/features/health/exec/main.js
```
