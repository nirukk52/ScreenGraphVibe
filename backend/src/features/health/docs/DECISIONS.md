# Decisions

- Exec runner is a CLI that prints JSON and exits (no HTTP server).
- `trace_id` is included in all responses; exec uses fixed value `EXEC_FIXED_TRACE_ID`.
- Mock mode is controlled via `MOCK_FEATURES` at the DI/composition edge.
- No cross-feature imports; only `shared/**` allowed.
