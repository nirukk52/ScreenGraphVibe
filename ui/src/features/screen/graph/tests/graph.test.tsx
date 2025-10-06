import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import GraphPage from '../pages/GraphPage.js';
import { apiClient } from '../../../../shared/api.js';
import type { GraphResponse, Run } from '../../../../shared/types.js';

// Mock the API client
vi.mock('../../../../shared/api.js', () => ({
  apiClient: {
    getGraph: vi.fn(),
    getRuns: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock ReactFlow
vi.mock('reactflow', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      {children}
    </div>
  ),
  Controls: () => <div data-testid="flow-controls" />,
  Background: () => <div data-testid="flow-background" />,
}));

const mockRuns: Run[] = [
  {
    runId: 'run-123',
    appId: 'demo-app',
    createdAt: '2024-01-01T00:00:00Z',
    status: 'completed',
  },
  {
    runId: 'run-456',
    appId: 'demo-app',
    createdAt: '2024-01-02T00:00:00Z',
    status: 'completed',
  },
];

const mockGraphResponse: GraphResponse = {
  runId: 'run-123',
  graph: {
    graphId: 'graph-123',
    appId: 'demo-app',
    runId: 'run-123',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    screens: [
      {
        screenId: 'screen-1',
        role: 'LoginScreen',
        textStems: ['login', 'email', 'password'],
        artifacts: {
          screenshotUrl: 'https://example.com/screenshot1.png',
          pageSourceDigest: 'abc123',
          axDigest: 'def456',
        },
        signature: {
          sketchHash: 'sketch-1',
          layoutBucket: 'auth',
          screenshotCoarseHash: 'coarse-1',
        },
        indexPath: '0',
      },
      {
        screenId: 'screen-2',
        role: 'Dashboard',
        textStems: ['dashboard', 'welcome'],
        artifacts: {
          screenshotUrl: 'https://example.com/screenshot2.png',
          pageSourceDigest: 'ghi789',
          axDigest: 'jkl012',
        },
        signature: {
          sketchHash: 'sketch-2',
          layoutBucket: 'main',
          screenshotCoarseHash: 'coarse-2',
        },
        indexPath: '0/1',
      },
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
          verbPostconditionHash: 'tap-route-hash',
        },
      },
    ],
    diffs: {
      addedScreens: [],
      removedScreens: [],
      addedActions: [],
      removedActions: [],
      changedActions: [],
    },
    counters: {
      screenCount: 2,
      actionCount: 1,
      interactiveCount: 1,
    },
    provenance: {
      extractionEngineVersion: '1.0.0',
      matcherVersion: '1.0.0',
      toleranceProfile: 'local-relaxed',
      jobId: 'job-123',
      agentId: 'agent-123',
    },
    annotations: {
      tags: ['demo', 'stub'],
      notes: 'Test graph data',
    },
  },
  screens: [],
  actions: [],
};

describe('GraphPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    
    // Mock health check to return a successful response
    vi.mocked(apiClient.healthCheck).mockResolvedValue({
      status: 'ok',
      message: 'All services operational',
      timestamp: new Date().toISOString(),
      requestId: 'test-123',
      region: 'local',
      environment: 'test',
      services: { database: 'healthy' }
    });
  });

  const renderGraphPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GraphPage />
      </QueryClientProvider>
    );
  };

  it('should render the graph page with header and controls', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    renderGraphPage();

    expect(screen.getByText('ScreenGraph Visualization')).toBeInTheDocument();
    expect(screen.getByText('← Back to Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Run:')).toBeInTheDocument();
  });

  it('should load and display available runs', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    renderGraphPage();

    await waitFor(() => {
      expect(apiClient.getRuns).toHaveBeenCalled();
    });

    const runSelect = screen.getByLabelText('Run:');
    expect(runSelect).toBeInTheDocument();
  });

  it('should load graph when a run is selected', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    renderGraphPage();

    await waitFor(() => {
      expect(apiClient.getRuns).toHaveBeenCalled();
    });

    // Select a run
    const runSelect = screen.getByLabelText('Run:');
    fireEvent.change(runSelect, { target: { value: 'run-123' } });

    await waitFor(() => {
      expect(apiClient.getGraph).toHaveBeenCalledWith('run-123');
    });
  });

  it('should display graph statistics when graph is loaded', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    renderGraphPage();

    // Select a run to load graph
    await waitFor(() => {
      expect(apiClient.getRuns).toHaveBeenCalled();
    });

    const runSelect = screen.getByLabelText('Run:');
    fireEvent.change(runSelect, { target: { value: 'run-123' } });

    await waitFor(() => {
      expect(screen.getByText('Screens: 2')).toBeInTheDocument();
      expect(screen.getByText('Actions: 1')).toBeInTheDocument();
      expect(screen.getByText('Interactive: 1')).toBeInTheDocument();
    });
  });

  it('should display React Flow when graph is loaded', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    renderGraphPage();

    // Select a run to load graph
    await waitFor(() => {
      expect(apiClient.getRuns).toHaveBeenCalled();
    });

    const runSelect = screen.getByLabelText('Run:');
    fireEvent.change(runSelect, { target: { value: 'run-123' } });

    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('flow-controls')).toBeInTheDocument();
      expect(screen.getByTestId('flow-background')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    vi.mocked(apiClient.getRuns).mockRejectedValue(new Error('API Error'));

    renderGraphPage();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching data', async () => {
    // Mock a delayed response
    vi.mocked(apiClient.getRuns).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ runs: mockRuns }), 100))
    );

    renderGraphPage();

    // Should show loading state initially
    expect(apiClient.getRuns).toHaveBeenCalled();
  });

  it('should show "No Graph Data" when no run is selected', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });

    renderGraphPage();

    await waitFor(() => {
      expect(screen.getByText('No Graph Data')).toBeInTheDocument();
      expect(screen.getByText('Select a run to view its ScreenGraph')).toBeInTheDocument();
    });
  });

  it('should handle empty runs list', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: [] });

    renderGraphPage();

    await waitFor(() => {
      const runSelect = screen.getByLabelText('Run:');
      const options = runSelect.querySelectorAll('option');
      expect(options).toHaveLength(1); // Only the default "Select a run..." option
    });
  });
});

describe('HealthIndicator Integration', () => {
  it('should display health status in graph page header', async () => {
    vi.mocked(apiClient.getRuns).mockResolvedValue({ runs: mockRuns });
    vi.mocked(apiClient.getGraph).mockResolvedValue(mockGraphResponse);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <GraphPage />
      </QueryClientProvider>
    );

    // Health status should be present in the header (it shows loading state initially)
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });
});
