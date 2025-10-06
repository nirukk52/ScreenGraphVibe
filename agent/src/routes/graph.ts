import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { 
  ScreenGraph, 
  GraphResponse, 
  Screen, 
  Action, 
  Counters,
  Diffs,
  Provenance
} from '../types/index.js';
import { Verb, Postcondition } from '../types/index.js';

// Stub data generator for demonstration
function generateStubScreenGraph(runId: string): ScreenGraph {
  const screens: Screen[] = [
    {
      screenId: 'screen-1',
      role: 'LoginScreen',
      textStems: ['login', 'email', 'password', 'sign in'],
      artifacts: {
        screenshotUrl: 'https://example.com/screenshots/login.png',
        pageSourceDigest: 'abc123',
        axDigest: 'def456'
      },
      signature: {
        sketchHash: 'sketch-1',
        layoutBucket: 'auth',
        screenshotCoarseHash: 'coarse-1'
      },
      indexPath: '0'
    },
    {
      screenId: 'screen-2',
      role: 'Dashboard',
      textStems: ['dashboard', 'welcome', 'profile', 'settings'],
      artifacts: {
        screenshotUrl: 'https://example.com/screenshots/dashboard.png',
        pageSourceDigest: 'ghi789',
        axDigest: 'jkl012'
      },
      signature: {
        sketchHash: 'sketch-2',
        layoutBucket: 'main',
        screenshotCoarseHash: 'coarse-2'
      },
      indexPath: '0/1'
    }
  ];

  const actions: Action[] = [
    {
      actionId: 'action-1',
      fromScreenId: 'screen-1',
      toScreenId: 'screen-2',
      verb: 'TAP' as Verb,
      targetRole: 'button',
      targetText: 'Sign In',
      postcondition: 'ROUTE_CHANGE' as Postcondition,
      signature: {
        verbPostconditionHash: 'tap-route-hash'
      }
    }
  ];

  const counters: Counters = {
    screenCount: screens.length,
    actionCount: actions.length,
    interactiveCount: actions.filter(a => a.verb === 'TAP').length
  };

  const diffs: Diffs = {
    addedScreens: [],
    removedScreens: [],
    addedActions: [],
    removedActions: [],
    changedActions: []
  };

  const provenance: Provenance = {
    extractionEngineVersion: '1.0.0',
    matcherVersion: '1.0.0',
    toleranceProfile: 'local-relaxed',
    jobId: `job-${runId}`,
    agentId: 'agent-123'
  };

  const result = {
    graphId: `graph-${runId}`,
    appId: 'demo-app',
    runId,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    screens,
    actions,
    diffs,
    counters,
    provenance,
    annotations: {
      tags: ['demo', 'stub'],
      notes: 'This is a stub ScreenGraph for demonstration purposes'
    }
  };

  return result;
}

export async function graphRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Get graph by run ID
  fastify.get('/graph/:runId', {
    schema: {
      description: 'Get ScreenGraph for a specific run',
      tags: ['graph'],
      params: {
        type: 'object',
        properties: {
          runId: {
            type: 'string',
            description: 'The run ID to get graph for'
          }
        },
        required: ['runId']
      },
      response: {
        200: {
          type: 'object',
          description: 'Graph response with screens and actions',
          properties: {
            runId: { type: 'string' },
            graph: {
              type: 'object',
              description: 'Complete ScreenGraph object'
            },
            screens: {
              type: 'array',
              items: { type: 'object' }
            },
            actions: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { runId } = request.params as { runId: string };
    
    // Simple stub response
    return reply.code(200).send({
      runId,
      graph: {
        graphId: `graph-${runId}`,
        appId: 'demo-app',
        runId,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        screens: [
          {
            screenId: 'screen-1',
            role: 'LoginScreen',
            textStems: ['login', 'email', 'password', 'sign in'],
            artifacts: {
              screenshotUrl: 'https://example.com/screenshot1.png',
              pageSourceDigest: 'abc123',
              axDigest: 'def456'
            },
            signature: {
              sketchHash: 'sketch-1',
              layoutBucket: 'auth',
              screenshotCoarseHash: 'coarse-1'
            },
            indexPath: '0'
          },
          {
            screenId: 'screen-2',
            role: 'Dashboard',
            textStems: ['dashboard', 'welcome', 'profile'],
            artifacts: {
              screenshotUrl: 'https://example.com/screenshot2.png',
              pageSourceDigest: 'ghi789',
              axDigest: 'jkl012'
            },
            signature: {
              sketchHash: 'sketch-2',
              layoutBucket: 'main',
              screenshotCoarseHash: 'coarse-2'
            },
            indexPath: '0/1'
          }
        ],
        actions: [
          {
            actionId: 'action-1',
            fromScreenId: 'screen-1',
            toScreenId: 'screen-2',
            verb: 'TAP',
            targetRole: 'button',
            targetText: 'Sign In',
            postcondition: 'ROUTE_CHANGE',
            signature: {
              verbPostconditionHash: 'tap-route-hash'
            }
          }
        ],
        diffs: {
          addedScreens: [],
          removedScreens: [],
          addedActions: [],
          removedActions: [],
          changedActions: []
        },
        counters: {
          screenCount: 2,
          actionCount: 1,
          interactiveCount: 1
        },
        provenance: {
          extractionEngineVersion: '1.0.0',
          matcherVersion: '1.0.0',
          toleranceProfile: 'local-relaxed',
          jobId: `job-${runId}`,
          agentId: 'agent-123'
        },
        annotations: {
          tags: ['demo', 'stub'],
          notes: 'Stubbed ScreenGraph data'
        }
      },
      screens: [],
      actions: []
    });
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
      const runs = [
        {
          runId: 'run-123',
          appId: 'demo-app',
          createdAt: new Date().toISOString(),
          status: 'completed'
        },
        {
          runId: 'run-456',
          appId: 'demo-app',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        }
      ];

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
