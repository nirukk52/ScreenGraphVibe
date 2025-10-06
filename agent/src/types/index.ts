export interface HealthCheckResponse {
  status: 'ok' | 'db_down';
  message: string;
  timestamp: string;
  requestId: string;
  region?: string;
  environment?: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis?: 'healthy' | 'unhealthy';
  };
}

export interface CrawlRequest {
  appId: string;
  platform: 'web' | 'mobile';
  packageName?: string;
  baselineId?: string;
}

export interface CrawlResponse {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
}

export interface StatusResponse {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

export interface GraphResponse {
  runId: string;
  graph: ScreenGraph;
  screens: Screen[];
  actions: Action[];
}

// ScreenGraph Types
export interface ScreenGraph {
  // --- Identity ---
  graphId: string;         // Unique ID for this screengraph snapshot
  appId: string;           // App this graph belongs to
  runId: string;           // Test/execution run that produced it
  version: string;         // Schema/capture version
  createdAt: string;       // When the graph was recorded (ISO string)

  // --- Nodes & Edges ---
  screens: Screen[];       // Nodes: each screen state
  actions: Action[];       // Edges: interactions connecting screens

  // --- Matching / Baseline ---
  baselineMatch?: BaselineMatch; // Match result vs baseline (optional)

  // --- Diffs ---
  diffs: Diffs;            // Added/removed screens/actions vs baseline

  // --- Stats ---
  counters: Counters;      // Counts for quick summaries

  // --- Provenance ---
  provenance: Provenance;  // Extractor/matcher versions, profiles, job/agent IDs

  // --- Optional metadata ---
  annotations?: Annotations; // Tags/notes for triage
}

export interface Screen {
  screenId: string;            // Stable ID for the screen node (e.g., hash of signature)
  role: string;                // Semantic type (e.g., "LoginScreen", "Dialog")
  textStems: string[];         // Salient text stems for fuzzy match
  artifacts: ScreenArtifacts;  // Screenshot URL + page source/accessibility digests
  signature: ScreenSignature;  // Structural identity for matching
  indexPath: string;           // Deterministic order key (e.g., "0/2/5")
  // Note: no bounds; a screen covers the whole viewport
}

export interface Action {
  actionId: string;            // Stable ID for the action edge
  fromScreenId: string;        // Source screen
  toScreenId: string;          // Destination screen
  verb: Verb;                  // TAP/TYPE/SCROLL/BACK/etc.
  targetRole?: string;         // Target role (button, input, etc.)
  targetText?: string;         // Target text or icon descriptor
  postcondition: Postcondition;// Outcome (route/dialog/list/text change)
  signature: ActionSignature;  // Digest for tolerance-based matching
}

export interface ScreenArtifacts {
  screenshotUrl: string;       // Presigned URL to screenshot (short TTL)
  pageSourceDigest: string;    // Digest of XML/AX tree for this screen
  axDigest: string;            // Digest of accessibility data
}

export interface ScreenSignature {
  sketchHash: string;          // Structural sketch hash
  layoutBucket: string;        // Coarse layout category/bucket
  screenshotCoarseHash: string; // Low-res perceptual hash
}

export interface ActionSignature {
  verbPostconditionHash: string; // Hash of (verb + outcome) for stability
}

export interface BaselineMatch {
  baselineId: string;                  // Baseline used
  screenMapping: Record<string, string>;  // observed screenId → baseline screenId
  actionMapping: Record<string, string>;  // observed actionId → baseline actionId
  pass: boolean;                       // Met thresholds?
  thresholdTau: number;                // Distance tolerance used
  coverage: Coverage;                  // Coverage percentages
}

export interface Coverage {
  screensMatchedPct: number;           // % screens matched
  actionsMatchedPct: number;           // % actions matched
}

export interface Diffs {
  addedScreens: string[];
  removedScreens: string[];
  addedActions: string[];
  removedActions: string[];
  changedActions: string[];
}

export interface Counters {
  screenCount: number;         // Total screens
  actionCount: number;         // Total actions
  interactiveCount: number;    // Count of interactive actions or key targets
}

export interface Provenance {
  extractionEngineVersion: string; // Extractor version
  matcherVersion: string;          // Matcher version
  toleranceProfile: string;        // "ci-strict" / "local-relaxed"
  jobId: string;                   // CI job ID
  agentId: string;                 // Automation agent ID
}

export interface Annotations {
  tags: string[];               // Labels for routing/priority
  notes?: string;               // Free-form triage notes
}

export enum Verb {
  TAP = 'TAP',
  TYPE = 'TYPE',
  SCROLL = 'SCROLL',
  BACK = 'BACK',
  LONG_PRESS = 'LONG_PRESS',
  SWIPE = 'SWIPE',
  UNKNOWN = 'UNKNOWN'
}

export enum Postcondition {
  ROUTE_CHANGE = 'ROUTE_CHANGE',
  HEADER_CHANGE = 'HEADER_CHANGE',
  DIALOG = 'DIALOG',
  LIST_CHANGE = 'LIST_CHANGE',
  TEXT_CHANGE = 'TEXT_CHANGE',
  NONE = 'NONE'
}
