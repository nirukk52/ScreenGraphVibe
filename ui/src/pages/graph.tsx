import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiClient } from '../lib/api';
import type { ScreenGraph, Screen, Action, Run } from '../types';
import { Verb } from '../types';
import HealthStatus from '../components/HealthStatus';

// Custom node component for screens
interface ScreenNodeProps {
  data: {
    screen: Screen;
  };
}

function ScreenNode({ data }: ScreenNodeProps) {
  const { screen } = data;
  
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm min-w-48">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">{screen.role}</h3>
        <p className="text-xs text-gray-500">ID: {screen.screenId}</p>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {screen.textStems.slice(0, 3).map((stem, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
            >
              {stem}
            </span>
          ))}
          {screen.textStems.length > 3 && (
            <span className="text-xs text-gray-500">
              +{screen.textStems.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom edge component for actions
function ActionEdge(props: any) {
  const { data } = props;
  const action = data?.action;
  
  if (!action) return null;
  
  const getVerbIcon = (verb: Verb) => {
    switch (verb) {
      case Verb.TAP:
        return '👆';
      case Verb.TYPE:
        return '⌨️';
      case Verb.SCROLL:
        return '📜';
      case Verb.BACK:
        return '⬅️';
      case Verb.LONG_PRESS:
        return '👆⏱️';
      case Verb.SWIPE:
        return '👈👉';
      default:
        return '❓';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs">{getVerbIcon(action.verb)}</span>
      <span className="text-xs font-medium text-gray-700">{action.verb}</span>
      {action.targetText && (
        <span className="text-xs text-gray-500">({action.targetText})</span>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
};

const edgeTypes: EdgeTypes = {
  action: ActionEdge,
};

export default function GraphPage() {
  const router = useRouter();
  const [graph, setGraph] = useState<ScreenGraph | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available runs on mount
  useEffect(() => {
    const loadRuns = async () => {
      try {
        const response = await apiClient.getRuns();
        setRuns(response.runs);
        if (response.runs.length > 0 && !selectedRunId) {
          setSelectedRunId(response.runs[0].runId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load runs');
      }
    };
    loadRuns();
  }, [selectedRunId]);

  // Load graph when run is selected
  useEffect(() => {
    if (selectedRunId) {
      loadGraph(selectedRunId);
    }
  }, [selectedRunId]);

  const loadGraph = async (runId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getGraph(runId);
      setGraph(response.graph);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  // Convert ScreenGraph to React Flow nodes and edges
  const getNodesAndEdges = useCallback((screenGraph: ScreenGraph) => {
    // Safety check for undefined screens
    if (!screenGraph.screens || !Array.isArray(screenGraph.screens)) {
      console.error('Invalid screenGraph.screens:', screenGraph.screens);
      return { nodes: [], edges: [] };
    }
    
    const nodes: Node[] = screenGraph.screens.map((screen, index) => ({
      id: screen.screenId,
      type: 'screen',
      position: { 
        x: index * 300, 
        y: Math.sin(index * 0.5) * 100 
      },
      data: { screen },
    }));

    // Safety check for undefined actions
    if (!screenGraph.actions || !Array.isArray(screenGraph.actions)) {
      console.error('Invalid screenGraph.actions:', screenGraph.actions);
      return { nodes, edges: [] };
    }
    
    const edges: Edge[] = screenGraph.actions.map((action) => ({
      id: action.actionId,
      source: action.fromScreenId,
      target: action.toScreenId,
      type: 'smoothstep',
      animated: true,
      data: { action },
      label: (
        <ActionEdge data={{ action }} />
      ),
    }));

    return { nodes, edges };
  }, []);

  const { nodes, edges } = graph ? getNodesAndEdges(graph) : { nodes: [], edges: [] };

  return (
    <>
      <Head>
        <title>ScreenGraph - Graph Visualization</title>
        <meta name="description" content="Visualize ScreenGraph data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="h-screen flex flex-col">
        {/* Header with health status */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                ScreenGraph Visualization
              </h1>
            </div>
            
            {/* Health Status Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <HealthStatus className="p-2" />
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="run-select" className="text-sm font-medium text-gray-700">
                Run:
              </label>
              <select
                id="run-select"
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                disabled={loading}
              >
                <option value="">Select a run...</option>
                {runs.map((run) => (
                  <option key={run.runId} value={run.runId}>
                    {run.runId} ({new Date(run.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {graph && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Screens: {graph.counters.screenCount}</span>
                <span>Actions: {graph.counters.actionCount}</span>
                <span>Interactive: {graph.counters.interactiveCount}</span>
              </div>
            )}

            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Graph Visualization */}
        <div className="flex-1 relative">
          {graph ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <Background gap={12} size={1} />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Graph Data
                </h3>
                <p className="text-gray-600">
                  {selectedRunId 
                    ? 'Select a run to view its ScreenGraph'
                    : 'Select a run from the dropdown above'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
