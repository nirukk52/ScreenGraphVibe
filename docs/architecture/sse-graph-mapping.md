# SSE Graph Event Mapping

Purpose: Map mocked SSE GraphEvents to UI ScreenGraph and agent models.

## Event → UI Model
- graph.run.started → init ScreenGraph
- graph.node.discovered → append Screen (minimal fields)
- graph.edge.created → append Action (from→to)
- graph.run.completed → finalize counts

## Minimal UI Screen
- screenId: event.nodeId
- role: screen
- textStems: [label?]
- artifacts: empty strings
- signature: mock hashes
- indexPath: sequence index

## Minimal UI Action
- actionId: `${from}->${to}-<seq>`
- fromScreenId/toScreenId: from/to
- verb: TAP
- targetRole: button
- targetText: ""
- postcondition: ROUTE_CHANGE
- signature.verbPostconditionHash: mock

## Kotlin Reference (Agent)
- ScreenGraphAgentState.counters ↔ UI counters
- EnumeratedAction.verb ↔ UI Action.verb
- ScreenGraph.screens/actions ↔ UI ScreenGraph

Notes: mock-mode only; real adapters enrich artifacts, signatures, provenance. All runtime strings from `backend/src/shared/constants.ts`.

