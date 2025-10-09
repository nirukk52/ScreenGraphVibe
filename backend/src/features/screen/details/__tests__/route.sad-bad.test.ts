import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerScreenDetailsRoute } from '../route.js';
import { FakeScreenDetailsAdapter } from '../adapters/fake.adapter.js';
import { NotFoundError, setErrorHandling } from '../../../../core/error.js';

describe('screen/details route sad/bad paths', () => {
  it('400 when input invalid', async () => {
    const app = Fastify({ logger: false });
    setErrorHandling(app);
    await registerScreenDetailsRoute(app, { port: new FakeScreenDetailsAdapter() });
    const res = await app.inject({
      method: 'POST',
      url: '/details/device-123',
      payload: { screenName: '' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('404 when domain not found', async () => {
    const app = Fastify({ logger: false });
    setErrorHandling(app);
    await registerScreenDetailsRoute(app, {
      port: {
        async run() {
          throw new NotFoundError('device');
        },
      } as any,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/details/device-404',
      payload: { screenName: 'Login' },
    });
    expect(res.statusCode).toBe(404);
  });
});


