import { HealthCheckResponse, GraphResponse, Run } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/healthz`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAgentStatus(): Promise<{ message: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Agent status check failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getGraph(runId: string): Promise<GraphResponse> {
    // Stub data for demonstration
    return {
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
    };
  }

  async getRuns(): Promise<{ runs: Run[] }> {
    // Stub data for demonstration
    return {
      runs: [
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
      ]
    };
  }
}

export const apiClient = new ApiClient();
