import { describe, it, expect } from 'vitest';
import { run } from '../exec/main.js';
import { ExecResponseSchema } from '../schemas/exec-response.schema.js';

describe('exec (self-executable)', () => {
  it('produces valid output', async () => {
    const out = await run({ traceId: 'test-trace' });
    expect(ExecResponseSchema.parse(out)).toBeTruthy();
  });
});
