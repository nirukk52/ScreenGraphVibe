// use case orchestration
import type { ScreenDetailsPort } from './port.js';
import type { HttpInput } from './schemas/http-input.schema.js';

export function makeUseCase(deps: { port: ScreenDetailsPort }) {
  return async (input: { params: { deviceID: string }; body: HttpInput }) => deps.port.run(input);
}
