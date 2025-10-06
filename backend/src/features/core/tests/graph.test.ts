import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { graphRoutes } from '../routes.js';
import type { ScreenGraph } from '../types.js';
import { Verb, Postcondition } from '../types.js';

describe('Graph Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(graphRoutes);
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('GET /graph/:runId', () => {
    it('should return a valid ScreenGraph for a given runId', async () => {
      const runId = 'test-run-123';
      
      const response = await fastify.inject({
        method: 'GET',
        url: `/graph/${runId}`
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data).toHaveProperty('runId', runId);
      expect(data).toHaveProperty('graph');
      expect(data).toHaveProperty('screens');
      expect(data).toHaveProperty('actions');

      // Validate ScreenGraph structure
      const graph: ScreenGraph = data.graph;
      expect(graph).toHaveProperty('graphId');
      expect(graph).toHaveProperty('appId', 'demo-app');
      expect(graph).toHaveProperty('runId', runId);
      expect(graph).toHaveProperty('version');
      expect(graph).toHaveProperty('createdAt');
      expect(graph).toHaveProperty('screens');
      expect(graph).toHaveProperty('actions');
      expect(graph).toHaveProperty('diffs');
      expect(graph).toHaveProperty('counters');
      expect(graph).toHaveProperty('provenance');

      // Validate screens array
      expect(Array.isArray(graph.screens)).toBe(true);
      expect(graph.screens.length).toBeGreaterThan(0);
      
      const screen = graph.screens[0];
      expect(screen).toHaveProperty('screenId');
      expect(screen).toHaveProperty('role');
      expect(screen).toHaveProperty('textStems');
      expect(screen).toHaveProperty('artifacts');
      expect(screen).toHaveProperty('signature');
      expect(screen).toHaveProperty('indexPath');

      // Validate actions array
      expect(Array.isArray(graph.actions)).toBe(true);
      expect(graph.actions.length).toBeGreaterThan(0);
      
      const action = graph.actions[0];
      expect(action).toHaveProperty('actionId');
      expect(action).toHaveProperty('fromScreenId');
      expect(action).toHaveProperty('toScreenId');
      expect(action).toHaveProperty('verb');
      expect(action).toHaveProperty('postcondition');
      expect(action).toHaveProperty('signature');

      // Validate verb enum
      expect(Object.values(Verb)).toContain(action.verb);

      // Validate postcondition enum
      expect(Object.values(Postcondition)).toContain(action.postcondition);

      // Validate counters
      expect(graph.counters.screenCount).toBe(graph.screens.length);
      expect(graph.counters.actionCount).toBe(graph.actions.length);
      expect(graph.counters.interactiveCount).toBeGreaterThanOrEqual(0);
    });

    it('should return different graphs for different runIds', async () => {
      const runId1 = 'test-run-123';
      const runId2 = 'test-run-456';
      
      const response1 = await fastify.inject({
        method: 'GET',
        url: `/graph/${runId1}`
      });

      const response2 = await fastify.inject({
        method: 'GET',
        url: `/graph/${runId2}`
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      const data1 = response1.json();
      const data2 = response2.json();

      expect(data1.runId).toBe(runId1);
      expect(data2.runId).toBe(runId2);
      expect(data1.graph.graphId).not.toBe(data2.graph.graphId);
    });

    it('should handle empty runId gracefully', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/graph/'
      });

      // Should return 404 for empty runId
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /runs', () => {
    it('should return a list of available runs', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/runs'
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      expect(data).toHaveProperty('runs');
      expect(Array.isArray(data.runs)).toBe(true);
      expect(data.runs.length).toBeGreaterThan(0);

      // Validate run structure
      const run = data.runs[0];
      expect(run).toHaveProperty('runId');
      expect(run).toHaveProperty('appId');
      expect(run).toHaveProperty('createdAt');
      expect(run).toHaveProperty('status');
      
      // Validate runId is a string
      expect(typeof run.runId).toBe('string');
      expect(run.runId.length).toBeGreaterThan(0);
    });

    it('should return runs with valid timestamps', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/runs'
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      const run = data.runs[0];
      
      // Validate createdAt is a valid ISO string
      const createdAt = new Date(run.createdAt);
      expect(createdAt).toBeInstanceOf(Date);
      expect(isNaN(createdAt.getTime())).toBe(false);
    });
  });

  describe('Graph Data Validation', () => {
    it('should generate consistent graph structure', async () => {
      const runId = 'consistency-test';
      
      // Make multiple requests to ensure consistency
      const responses = await Promise.all([
        fastify.inject({ method: 'GET', url: `/graph/${runId}` }),
        fastify.inject({ method: 'GET', url: `/graph/${runId}` }),
        fastify.inject({ method: 'GET', url: `/graph/${runId}` })
      ]);

      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });

      const datas = responses.map(r => r.json());
      
      // All responses should have the same structure
      datas.forEach(data => {
        expect(data.runId).toBe(runId);
        expect(data.graph.screens).toHaveLength(2); // Based on stub data
        expect(data.graph.actions).toHaveLength(1); // Based on stub data
      });

      // Graph IDs should be consistent for the same runId
      const graphIds = datas.map(d => d.graph.graphId);
      expect(new Set(graphIds).size).toBe(1); // All should be the same
    });

    it('should validate action connections to screens', async () => {
      const runId = 'connection-test';
      
      const response = await fastify.inject({
        method: 'GET',
        url: `/graph/${runId}`
      });

      expect(response.statusCode).toBe(200);
      
      const data = response.json();
      const graph = data.graph;
      
      // Validate that all actions reference existing screens
      const screenIds = graph.screens.map((s: any) => s.screenId);
      
      graph.actions.forEach((action: any) => {
        expect(screenIds).toContain(action.fromScreenId);
        expect(screenIds).toContain(action.toScreenId);
      });
    });
  });
});
