import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerScreenDetailsRoute } from '../route.js';
import { FakeScreenDetailsAdapter } from '../adapters/fake.adapter.js';

describe('screen/details route happy path', () => {
  it('POST /details/:deviceID returns 200 with envelope and data', async () => {
    const app = Fastify({ logger: false });
    await registerScreenDetailsRoute(app, { port: new FakeScreenDetailsAdapter() });
    const res = await app.inject({
      method: 'POST',
      url: '/details/device-123',
      payload: { screenName: 'Login' },
    });
    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.ok).toBe(true);
    expect(json.data).toMatchObject({ deviceID: 'device-123', screenName: 'Login', status: 'received' });
  });
});


