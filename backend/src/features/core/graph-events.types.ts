/**
 * @module features/core/graph-events.types
 * @description Typed payloads for mocked graph SSE events.
 * @publicAPI GraphEvent
 */
import { GRAPH_EVENTS } from '../../shared/constants.js';

export type GraphEventName = (typeof GRAPH_EVENTS)[keyof typeof GRAPH_EVENTS];

export type GraphRunStarted = { runId: string; ts: number };
export type GraphNodeDiscovered = { nodeId: string; label?: string; ts?: number };
export type GraphEdgeCreated = { from: string; to: string; verb: string; ts?: number };
export type GraphRunCompleted = { runId: string; totalNodes?: number };
export type GraphRunErrored = { runId: string; code: string; message: string };

export type GraphEvent =
  | { type: typeof GRAPH_EVENTS.RUN_STARTED; id?: string; data: GraphRunStarted }
  | { type: typeof GRAPH_EVENTS.NODE_DISCOVERED; id?: string; data: GraphNodeDiscovered }
  | { type: typeof GRAPH_EVENTS.EDGE_CREATED; id?: string; data: GraphEdgeCreated }
  | { type: typeof GRAPH_EVENTS.RUN_COMPLETED; id?: string; data: GraphRunCompleted }
  | { type: typeof GRAPH_EVENTS.RUN_ERRORED; id?: string; data: GraphRunErrored };



