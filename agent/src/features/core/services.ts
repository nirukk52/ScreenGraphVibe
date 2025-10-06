import type { ScreenGraph, Screen, Action, Counters, Diffs, Provenance, Verb, Postcondition } from './types.js';

// Stub data generator for demonstration
export function generateStubScreenGraph(runId: string): ScreenGraph {
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

export function generateStubRuns() {
  return [
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
}
