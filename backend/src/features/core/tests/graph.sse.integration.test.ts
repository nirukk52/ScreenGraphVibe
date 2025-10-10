import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { graphRoutes } from '../routes.js';

describe('graph SSE route', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(graphRoutes);
  });

  afterAll(async () => {
    await app.close();
  });

  it('streams mocked events and completes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/graph/events.sse?count=3&intervalMs=10&runId=test-run',
    });

    expect(response.statusCode).toBe(200);
    const body = response.body as string;
    expect(body).toContain('event: graph.run.started');
    expect(body).toContain('event: graph.run.completed');

    const nodeEvents = body.split('\n').filter((l: string) => l.includes('event: graph.node.discovered'));
    expect(nodeEvents.length).toBeGreaterThanOrEqual(3);
  });
});



