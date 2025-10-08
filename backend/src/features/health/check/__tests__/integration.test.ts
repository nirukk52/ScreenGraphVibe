import { describe, it, expect } from 'vitest';
import { createHealthCheckApp } from '../../check/exec/main.js';

describe('health/check exec', () => {
  it('returns 200 and deterministic JSON', async () => {
    const app = await createHealthCheckApp();
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({ status: 'ok', requestId: 'fake-request-id' });
  });
});


