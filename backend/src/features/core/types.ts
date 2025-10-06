export interface ScreenGraph {
  graphId: string;
  appId: string;
  runId: string;
  version: string;
  createdAt: string;
  screens: Screen[];
  actions: Action[];
  diffs: Diffs;
  counters: Counters;
  provenance: Provenance;
  annotations?: {
    tags?: string[];
    notes?: string;
  };
}

export interface Screen {
  screenId: string;
  role: string;
  textStems: string[];
  artifacts: {
    screenshotUrl: string;
    pageSourceDigest: string;
    axDigest: string;
  };
  signature: {
    sketchHash: string;
    layoutBucket: string;
    screenshotCoarseHash: string;
  };
  indexPath: string;
}

export interface Action {
  actionId: string;
  fromScreenId: string;
  toScreenId: string;
  verb: Verb;
  targetRole: string;
  targetText: string;
  postcondition: Postcondition;
  signature: {
    verbPostconditionHash: string;
  };
}

export enum Verb {
  TAP = 'TAP',
  TYPE = 'TYPE',
  SCROLL = 'SCROLL',
  BACK = 'BACK',
  LONG_PRESS = 'LONG_PRESS',
  SWIPE = 'SWIPE',
}

export enum Postcondition {
  ROUTE_CHANGE = 'ROUTE_CHANGE',
  STATE_CHANGE = 'STATE_CHANGE',
  NO_CHANGE = 'NO_CHANGE',
}

export interface Diffs {
  addedScreens: Screen[];
  removedScreens: Screen[];
  addedActions: Action[];
  removedActions: Action[];
  changedActions: Action[];
}

export interface Counters {
  screenCount: number;
  actionCount: number;
  interactiveCount: number;
}

export interface Provenance {
  extractionEngineVersion: string;
  matcherVersion: string;
  toleranceProfile: string;
  jobId: string;
  agentId: string;
}

export interface GraphResponse {
  runId: string;
  graph: ScreenGraph;
  screens: Screen[];
  actions: Action[];
}

export interface Run {
  runId: string;
  appId: string;
  createdAt: string;
  status: string;
}
