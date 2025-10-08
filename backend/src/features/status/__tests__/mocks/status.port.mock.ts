import type { ClockPort } from '../../status.port.js';

export function makeClockPortMock(fixedIso = '2025-01-01T00:00:00.000Z'): ClockPort {
  return {
    nowIso: () => fixedIso,
  };
}


