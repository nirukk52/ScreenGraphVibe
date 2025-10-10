# ADR: MVP Vertical Slice — SSE Mock Stream for Graph Events

Date: 2025-10-10
Status: active

## Context
We need a fast, visible MVP: a mocked end-to-end stream that emits graph events and builds a UI graph incrementally, with a clean path to swap mock for real adapters.

## Decision
- Add `GET /graph/events.sse` SSE route emitting deterministic events every N ms
- Use feature port `GraphEventPublisherPort` with a fake adapter; wire via usecase
- UI consumes via `EventSource`, builds in-memory `ScreenGraph`, renders with React Flow

## Consequences
- Clear seam to replace fake with agent-backed publisher
- Deterministic tests (SSE integration + UI control presence)
- Minimal risk, quick demo value

## Next Steps
- Add real adapter behind the port
- Add Playwright E2E for streaming
- Extend validation and schemas; strengthen error paths

