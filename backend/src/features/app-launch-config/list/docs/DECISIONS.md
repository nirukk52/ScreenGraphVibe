# Decisions

- Exec is CLI and mirrors route happy path; prints exact response with `trace_id`.
- Mock mode decided at composition edge (env `MOCK_FEATURES`).
- No cross-feature imports; fakes live inside sub-feature.
