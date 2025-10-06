import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { 
  ScreenGraph, 
  GraphResponse, 
  Screen, 
  Action, 
  Counters,
  Diffs,
  Provenance
} from './types.js';
import { Verb, Postcondition } from './types.js';
import { generateStubScreenGraph, generateStubRuns } from './services.js';

export async function graphRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Get graph by run ID
  fastify.get('/graph/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    
    // Handle empty runId
    if (!runId || runId.trim() === '') {
      return reply.code(404).send({
        error: 'Run ID is required',
        message: 'Please provide a valid run ID'
      });
    }
    
    try {
      const graph = generateStubScreenGraph(runId);
      
      // Create a clean response object to avoid serialization issues
      const response = {
        runId,
        graph: {
          graphId: graph.graphId,
          appId: graph.appId,
          runId: graph.runId,
          version: graph.version,
          createdAt: graph.createdAt,
          screens: graph.screens,
          actions: graph.actions,
          diffs: graph.diffs,
          counters: graph.counters,
          provenance: graph.provenance,
          annotations: graph.annotations
        },
        screens: graph.screens,
        actions: graph.actions
      };
      
      return reply.code(200).send(response);
    } catch (error) {
      fastify.log.error(`Error getting graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return reply.code(500).send({
        error: 'Failed to get graph',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List available runs (for demo purposes)
  fastify.get('/runs', {
    schema: {
      description: 'List available runs',
      tags: ['graph'],
      response: {
        200: {
          type: 'object',
          properties: {
            runs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  runId: { type: 'string' },
                  appId: { type: 'string' },
                  createdAt: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Return stub runs for demo
      const runs = generateStubRuns();

      return reply.code(200).send({ runs });
    } catch (error) {
      fastify.log.error(`Error listing runs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return reply.code(500).send({
        error: 'Failed to list runs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
