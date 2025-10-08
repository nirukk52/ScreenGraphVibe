# app-launch-config/list (sub-feature)

Purpose: exposes `/app-launch-configs` with Zod-validated response.

- Executable: `features/app-launch-config/list/exec/main.ts` prints deterministic JSON with fixed `trace_id`.
- Port: `features/app-launch-config/list/port.ts`
- Use case: `features/app-launch-config/list/usecase.ts`

Run exec:
```bash
node dist/src/features/app-launch-config/list/exec/main.js
```
