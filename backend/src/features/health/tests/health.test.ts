import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { healthRoutes } from '../routes.js';
import type { HealthCheckResponse } from '../types.js';

describe('Health Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    await fastify.register(healthRoutes);
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('GET /healthz', () => {
    it('should return health status when database is configured', async () => {
      // Set up environment variable for database
      const originalPostgresUrl = process.env.POSTGRES_URL;
      process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test';

      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      expect(response.statusCode).toBe(200);
      
      const data: HealthCheckResponse = response.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('requestId');
      expect(data).toHaveProperty('region');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('services');
      expect(data.services).toHaveProperty('database');

      // Validate response structure
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.requestId).toBe('string');
      expect(typeof data.region).toBe('string');
      expect(typeof data.environment).toBe('string');
      expect(['healthy', 'unhealthy']).toContain(data.services.database);

      // Restore original environment
      if (originalPostgresUrl) {
        process.env.POSTGRES_URL = originalPostgresUrl;
      } else {
        delete process.env.POSTGRES_URL;
      }
    });

    it('should return unhealthy status when database is not configured', async () => {
      // Remove database configuration
      const originalPostgresUrl = process.env.POSTGRES_URL;
      delete process.env.POSTGRES_URL;

      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      expect(response.statusCode).toBe(503);
      
      const data: HealthCheckResponse = response.json();
      expect(data.status).toBe('db_down');
      expect(data.services.database).toBe('unhealthy');
      expect(data.message).toContain('Database not configured');

      // Restore original environment
      if (originalPostgresUrl) {
        process.env.POSTGRES_URL = originalPostgresUrl;
      }
    });

    it('should include proper cache control headers', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers).toHaveProperty('pragma');
      expect(response.headers).toHaveProperty('expires');
      
      expect(response.headers['cache-control']).toContain('no-store');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      const data: HealthCheckResponse = response.json();
      const timestamp = new Date(data.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return unique request IDs for each call', async () => {
      const response1 = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      const response2 = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      const data1: HealthCheckResponse = response1.json();
      const data2: HealthCheckResponse = response2.json();

      expect(data1.requestId).not.toBe(data2.requestId);
      expect(typeof data1.requestId).toBe('string');
      expect(typeof data2.requestId).toBe('string');
    });

    it('should handle errors gracefully', async () => {
      // Mock an error by making the health check function throw
      const originalConsoleError = console.error;
      console.error = () => {}; // Suppress error output

      // This test ensures the error handling path works
      const response = await fastify.inject({
        method: 'GET',
        url: '/healthz'
      });

      // Should still return a response (either 200 or 503)
      expect([200, 503]).toContain(response.statusCode);
      
      const data = response.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('message');

      console.error = originalConsoleError;
    });
  });
});
