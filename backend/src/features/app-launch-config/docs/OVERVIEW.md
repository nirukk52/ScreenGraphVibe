# app-launch-config (feature)

Purpose: top-level executable and docs for app launch config feature.

- Executable: `features/app-launch-config/exec/main.ts` (CLI) prints deterministic JSON with fixed `trace_id`.
- Mock mode: `MOCK_FEATURES=app-launch-config` mocks all sub-features.
- Sub-features: `list`.

Run:
```bash
node dist/src/features/app-launch-config/exec/main.js
```
