/**
 * @module features/graph/events/adapters/fake.adapter
 * @description Timer-based fake publisher that emits deterministic graph events.
 */
import { GRAPH_EVENTS } from '../../../../shared/constants.js';
import type { GraphEvent } from '../../../core/graph-events.types.js';
import type { GraphEventPublisherPort, GraphEventStreamParams } from '../port.js';

export function makeMockGraphEventPublisher(): GraphEventPublisherPort {
  return {
    start(params: GraphEventStreamParams, onEvent: (e: GraphEvent) => void, onDone: () => void) {
      const runId = params.runId ?? 'mock-run';
      onEvent({ type: GRAPH_EVENTS.RUN_STARTED, data: { runId, ts: Date.now() } });
      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        const nodeId = `node-${i}`;
        onEvent({ type: GRAPH_EVENTS.NODE_DISCOVERED, data: { nodeId, label: `Screen ${i}`, ts: Date.now() } });
        if (i > 1) {
          onEvent({ type: GRAPH_EVENTS.EDGE_CREATED, data: { from: `node-${i - 1}`, to: nodeId, verb: 'TAP', ts: Date.now() } });
        }
        if (i >= params.count) {
          clearInterval(interval);
          onEvent({ type: GRAPH_EVENTS.RUN_COMPLETED, data: { runId, totalNodes: i } });
          onDone();
        }
      }, params.intervalMs);

      return () => clearInterval(interval);
    },
  };
}



