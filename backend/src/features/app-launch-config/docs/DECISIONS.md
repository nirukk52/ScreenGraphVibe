# Decisions

- Exec runner is CLI; prints deterministic JSON and exits.
- `trace_id` included everywhere; exec uses fixed `EXEC_FIXED_TRACE_ID`.
- Mock mode via `MOCK_FEATURES` at composition edge; no branching in usecases.
- No cross-feature imports; fakes live in sub-feature.
