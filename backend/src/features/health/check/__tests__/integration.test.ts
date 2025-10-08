import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerHealthCheckRoute } from '../../check/route.js';
import { FakeHealthCheckAdapter } from '../../check/adapters/fake.adapter.js';

describe('health/check exec', () => {
  it('returns 200 and schema-valid JSON with trace_id', async () => {
    const app = Fastify({ logger: false });
    await registerHealthCheckRoute(app, { port: new FakeHealthCheckAdapter() });
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.requestId).toBe('fake-request-id');
    expect(typeof body.trace_id).toBe('string');
  });
});


