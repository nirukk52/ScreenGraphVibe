import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import type { ScreenGraph, Run } from '../../../../shared/types';
import { apiClient } from '../../../../shared/api';
import { GraphVisualization } from '../components/GraphVisualization';
import HealthIndicator from '../../health/components/HealthIndicator';

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
              <h1 className="text-xl font-semibold text-gray-900">ScreenGraph Visualization</h1>
            </div>

            {/* Health Status Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <HealthIndicator className="p-2" />
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
          <GraphVisualization graph={graph} loading={loading} />
        </div>
      </main>
    </>
  );
}
