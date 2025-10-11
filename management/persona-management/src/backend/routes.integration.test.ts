/**
 * @module routes.integration.test
 * @description Integration tests for persona management routes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { personasRoutes } from './routes';

describe('Persona Management Routes Integration', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = Fastify();
    await server.register(personasRoutes);
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should list all personas via GET /management/personas', async () => {
    // Act
    const response = await server.inject({
      method: 'GET',
      url: '/management/personas',
    });

    // Assert
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.personas).toBeDefined();
    expect(Array.isArray(data.personas)).toBe(true);
    expect(data.personas.length).toBeGreaterThan(0);

    // Validate structure
    const firstPersona = data.personas[0];
    expect(firstPersona.id).toBeDefined();
    expect(firstPersona.name).toBeDefined();
  });

  it('should create a new persona via POST /management/personas', async () => {
    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/management/personas',
      payload: {
        id: 'test_integration_persona',
        name: 'Test Integration Persona',
        role: 'Tester',
      },
    });

    // Assert
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.created).toBeDefined();
  });

  it('should update a persona via PUT /management/personas/:id', async () => {
    // Act
    const response = await server.inject({
      method: 'PUT',
      url: '/management/personas/ian_botts_cto',
      payload: {
        name: 'Ian Botts — CTO Updated',
        role: 'CTO (Graphiti-First)',
      },
    });

    // Assert
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.updated).toBeDefined();
  });

  it('should delete a persona via DELETE /management/personas/:id', async () => {
    // Act
    const response = await server.inject({
      method: 'DELETE',
      url: '/management/personas/test_integration_persona',
    });

    // Assert
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.deleted).toBeDefined();
  });
});

