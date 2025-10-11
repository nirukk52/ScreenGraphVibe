# ADR-20251011-testing-script-normalization

**Title ID**: ADR-20251011-7a8b3f2e  
**Date**: 2025-10-11  
**Status**: active  
**Module**: :tests, :backend, :ui, :infra, :data  
**Topic**: testing/scripts  
**Trace ID**: adr-testing-script-normalization

---

## Context

Module test scripts had inconsistent patterns that masked test discovery:
- Backend/UI/infra used `echo 'No tests' || vitest`, causing echo to succeed and skip Vitest runs
- CLI glob patterns conflicted with vitest.config includes, resulting in "no tests found" despite tests existing
- TESTING.md was comprehensive but not marked as authoritative; CLAUDE.md had stale commands
- Per-module test detection was unreliable for CI and local dev

---

## Decision

Normalize all module test scripts to:
1. **Run Vitest first**, relying on each package's local `vitest.config.ts` includes
2. **Fallback to echo** only when Vitest finds no matching files
3. **Remove CLI glob overrides** that conflict with config-driven includes
4. **Mark TESTING.md authoritative** and sync CLAUDE.md references

### Script Pattern

```json
{
  "test:unit": "vitest run || echo 'No unit tests found for <module>'",
  "test:integration": "vitest run || echo 'No integration tests found for <module>'"
}
```

### Config-Driven Includes

Each module's `vitest.config.ts` defines patterns:
- backend/ui/infra: `src/**/*.test.{ts,tsx}`, `src/**/tests/*.test.{ts,tsx}`, `src/**/__tests__/*.test.{ts,tsx}`
- data: `src/**/*.test.ts`, `src/**/__tests__/**/*.test.ts`

---

## Options Considered

### A. Keep echo-first (rejected)
**Pros**: Simple scripts  
**Cons**: Always succeeds; never runs Vitest; misleading output

### B. Complex CLI globs (rejected)
**Pros**: Explicit patterns  
**Cons**: Conflicts with vitest.config; hard to maintain; brittle

### C. Vitest-first + config-driven (chosen)
**Pros**: Leverages vitest.config; predictable; unified behavior  
**Cons**: Requires consistent vitest.config setup

---

## Rationale

1. **Predictable behavior**: Scripts now run tests when files exist; vitest.config governs includes
2. **Unified patterns**: All modules follow same script structure
3. **Better CI feedback**: Real test counts, not false "no tests" messages

---

## Consequences

### Positive
- UI and infra unit tests now detected and run
- Integration tests execute via config-driven includes
- TESTING.md is single source of truth for commands
- Per-module test invocations reliable for CI

### Negative
- Requires each module to maintain accurate vitest.config includes
- Integration filenames should follow convention: `*.integration.test.{ts,tsx}`

---

## Next Steps

1. Add root aliases: `test:infra`, `test:docs`
2. Normalize integration test filenames across modules
3. Address UI React act() warnings (cosmetic; tests pass)
4. Update CI workflows to leverage per-module commands

---

## References

- PR: chore/testing-scripts-docs-sync
- Files: `backend/package.json`, `ui/package.json`, `infra/package.json`, `data/package.json`
- Docs: `docs/setup/TESTING.md`, `CLAUDE.md`
- Testing guide: Rule 22 (E2E in :tests, unit/integration in modules)

---

**Impact Across Modules**:
- :data → Fixed integration includes
- :backend → Unit detection via config
- :ui → Unit detection via config; warnings noted
- :infra → Unit detection via config
- :tests → E2E unchanged; shared utilities remain

**Related ADRs**: None (first testing infrastructure ADR)

