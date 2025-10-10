/**
 * @module features/graph/events/port
 * @description Feature-scoped port for publishing graph events.
 * @publicAPI GraphEventPublisherPort
 */
import type { GraphEvent } from '../../core/graph-events.types.js';

export type GraphEventStreamParams = {
  runId?: string;
  count: number;
  intervalMs: number;
};

export interface GraphEventPublisherPort {
  start(
    params: GraphEventStreamParams,
    onEvent: (event: GraphEvent) => void,
    onDone: () => void,
  ): () => void; // returns stop function
}



