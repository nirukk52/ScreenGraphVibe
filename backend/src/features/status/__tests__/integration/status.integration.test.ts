import { describe, it, expect } from 'vitest';
import { createApp } from '../../../../core/app.js';
import { statusRoutes } from '../../../status/status.routes.js';

describe('Status routes (integration)', () => {
  it('GET /status returns ok', async () => {
    const app = await createApp();
    await app.register(statusRoutes);
    const res = await app.inject({ method: 'GET', url: '/status' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe('backend');
    expect(typeof body.timestamp).toBe('string');
  });
});
