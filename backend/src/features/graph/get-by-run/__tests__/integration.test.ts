import { describe, it, expect } from 'vitest';
import { createGraphGetByRunApp } from '../../get-by-run/exec/main.js';

describe('graph/get-by-run exec', () => {
  it('returns 200 and deterministic JSON', async () => {
    const app = await createGraphGetByRunApp();
    const res = await app.inject({ method: 'GET', url: '/graph/123' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.runId).toBe('123');
    expect(body.graph.graphId).toBe('graph-1');
  });
});


