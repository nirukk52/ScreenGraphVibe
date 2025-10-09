import { describe, it, expect } from 'vitest';
import { run } from '../exec/main.js';
import { AppLaunchConfigListResponseSchema } from '../schemas/response.schema.js';

describe('app-launch-config/list exec', () => {
  it('produces valid output', async () => {
    const out = await run({ traceId: 'test-trace' });
    expect(AppLaunchConfigListResponseSchema.parse(out)).toBeTruthy();
  });
});


