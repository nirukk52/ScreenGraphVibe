import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerAppLaunchConfigListRoute } from '../../list/route.js';
import { FakeAppLaunchConfigListAdapter } from '../../list/adapters/fake.adapter.js';

describe('app-launch-config/list exec', () => {
  it('returns 200 and schema-valid JSON with trace_id', async () => {
    const app = Fastify({ logger: false });
    await registerAppLaunchConfigListRoute(app, { port: new FakeAppLaunchConfigListAdapter() });
    const res = await app.inject({ method: 'GET', url: '/app-launch-configs' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe('cfg-1');
    expect(typeof body.trace_id).toBe('string');
  });
});


