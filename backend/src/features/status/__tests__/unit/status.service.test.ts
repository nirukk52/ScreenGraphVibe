import { describe, it, expect } from 'vitest';
import { StatusService } from '../../../status/status.service.js';
import { makeClockPortMock } from '../mocks/status.port.mock.js';

describe('StatusService', () => {
  it('returns ok backend status with fixed timestamp', async () => {
    const clock = makeClockPortMock('2025-01-02T03:04:05.000Z');
    const svc = new StatusService(clock);
    const res = await svc.getStatus();
    expect(res).toEqual({ ok: true, service: 'backend', timestamp: '2025-01-02T03:04:05.000Z' });
  });
});
