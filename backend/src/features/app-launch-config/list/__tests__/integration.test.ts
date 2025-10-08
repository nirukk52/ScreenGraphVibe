import { describe, it, expect } from 'vitest';
import { createAppLaunchConfigListApp } from '../../list/exec/main.js';

describe('app-launch-config/list exec', () => {
  it('returns 200 and deterministic JSON', async () => {
    const app = await createAppLaunchConfigListApp();
    const res = await app.inject({ method: 'GET', url: '/app-launch-configs' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe('cfg-1');
  });
});


