# health/check (sub-feature)

Purpose: exposes `/healthz` with Zod-validated response.

- Executable: `features/health/check/exec/main.ts` prints deterministic JSON with fixed `trace_id`.
- Port: `features/health/check/port.ts`
- Use case: `features/health/check/usecase.ts`

Run exec:
```bash
node dist/src/features/health/check/exec/main.js
```
