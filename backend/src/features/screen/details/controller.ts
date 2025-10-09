// HTTP controller
import type { FastifyRequest, FastifyReply } from 'fastify';
import { makeUseCase } from './usecase.js';
import type { ScreenDetailsPort } from './port.js';
import { HttpParamsSchema } from './schemas/http-params.schema.js';
import { HttpInputSchema } from './schemas/http-input.schema.js';
import { HttpOutputSchema } from './schemas/http-output.schema.js';
import { HTTP_STATUS, success } from '../../../shared/http.js';
import { withSpan } from '../../../core/tracing.js';
import { ValidationError } from '../../../core/error.js';

type Req = FastifyRequest<{ Params: { deviceID: string }; Body: unknown }>;

export function makeController(deps: { port: ScreenDetailsPort }) {
  const exec = makeUseCase(deps);
  return async (req: Req, res: FastifyReply) =>
    withSpan('screen.details', async () => {
      let params: { deviceID: string };
      let body: { screenName: string };
      try {
        params = HttpParamsSchema.parse(req.params ?? {});
        body = HttpInputSchema.parse(req.body ?? {});
      } catch (err) {
        throw new ValidationError(err);
      }
      const out = await exec({ params, body });
      const parsed = HttpOutputSchema.parse(out);
      req.log.info({ route: 'screen.details', deviceID: params.deviceID, screenName: body.screenName }, 'screen details received');
      return res.code(HTTP_STATUS.OK).send(success(parsed));
    });
}
