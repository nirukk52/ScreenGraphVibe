// feature port (define real contract per feature)
import type { HttpInput } from './schemas/http-input.schema.js';
import type { HttpOutput } from './schemas/http-output.schema.js';

export interface ScreenDetailsPort {
  run(input: { params: { deviceID: string }; body: HttpInput }): Promise<HttpOutput>;
}
