import type { FastifyRequest, FastifyReply } from 'fastify';
import { createSseStream } from '../../../shared/sse.js';
import { withSpan } from '../../../core/tracing.js';
import { HttpParamsSchema } from './schemas/http-params.schema.js';
import { SseEventSchema } from './schemas/sse-event.schema.js';
import { SCREEN_EVENTS } from '../../../shared/constants.js';

type Req = FastifyRequest<{ Params: { deviceID: string } }>;

export function makeSseController() {
  return async (req: Req, res: FastifyReply) =>
    withSpan('screen.details.sse', async () => {
      const params = HttpParamsSchema.parse(req.params ?? {});
      const stream = createSseStream(res);
      const event = SseEventSchema.parse({
        type: SCREEN_EVENTS.DETAILS_RECEIVED,
        data: { deviceID: params.deviceID, message: 'stream-started' },
      });
      stream.send(event);
      stream.end();
    });
}


