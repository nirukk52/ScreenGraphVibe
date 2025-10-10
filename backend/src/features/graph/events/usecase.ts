/**
 * @module features/graph/events/usecase
 * @description Orchestrates starting a mocked graph run via a publisher port.
 * @publicAPI makeStartGraphRunUsecase
 */
import type { GraphEvent } from '../../core/graph-events.types.js';
import type { GraphEventPublisherPort, GraphEventStreamParams } from './port.js';

export function makeStartGraphRunUsecase(port: GraphEventPublisherPort) {
  return (
    params: GraphEventStreamParams,
    onEvent: (event: GraphEvent) => void,
    onDone: () => void,
  ) => port.start(params, onEvent, onDone);
}



