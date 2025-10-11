# Retro: 2025-10-10 — Long vertical slice CI and management setup (RETRO-20251010)

## What we aimed to do
- Establish management workflows (PR template, CODEOWNERS, auto-assign)
- Add CI reliability (fail-fast, repo validation)
- Deliver vertical slice: mocked SSE stream + UI hookup
- Add PR artifacts: capture /graph screenshot via Playwright

## What we shipped
- PR #9: CI fail-fast fixes
- PR #10: Management strategy (templates, owners, auto-assign)
- PR #11: :pr-artifacts module + CI screenshot for /graph

## Metrics
- PRs merged: 2 (9,10), open: 1 (11)
- Avg PR checks time: ~2–4 min

---

## Ian Botts — CTO
- What went well:
  - Clear adherence to clean architecture; :pr-artifacts is isolated
  - CI scripts now fail fast; reduced silent green
  - PR template includes Graphiti fields → traceability
- What didn’t:
  - Branch discipline briefly slipped (two parallel branches)
  - Some validation docs landed after code
- Next:
  - Enforce branch policy via protected branches
  - Expand ADR coverage around CI artifacts and SSE taxonomy

## Rino — Senior Engineer
- What went well:
  - Vertical slice delivered end-to-end (backend → UI → CI screenshot)
  - Simple mock adapters enabled fast iteration
- What didn’t:
  - Initial conflicts between PRs slowed merge
  - Playwright flow should accept route/selector from issue body
- Next:
  - Add input parsing from PR/issue description
  - Stabilize CI startup (health wait with retries)

## Jacob — Backend Engineer
- What went well:
  - SSE mock route typed and tested; Zod schemas solid
  - Usecase/port separation kept controller slim
- What didn’t:
  - Missing structured logs for SSE path in /healthz
  - No replay fixture yet for real mode
- Next:
  - Add agent stub fixture JSON
  - Extend healthz to verify SSE deps & DI wiring

---

## Action Items
- [ ] Parametrize screenshot capture via issue/PR description
- [ ] Add retries + health probe step to CI before capture
- [ ] Create agent stub fixtures for replay
- [ ] Update /healthz to cover SSE dependencies
- [ ] Write ADR for PR artifacts approach
