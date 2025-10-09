// Fake adapter for tests/exec
import type { ScreenDetailsPort } from '../port.js';
import { SCREEN_STATUS } from '../../../../shared/constants.js';
import type { HttpOutput } from '../schemas/http-output.schema.js';

export class FakeScreenDetailsAdapter implements ScreenDetailsPort {
  async run(input: { params: { deviceID: string }; body: { screenName: string } }): Promise<HttpOutput> {
    const { deviceID } = input.params;
    const { screenName } = input.body;
    return { deviceID, screenName, status: SCREEN_STATUS.RECEIVED } as const;
  }
}
