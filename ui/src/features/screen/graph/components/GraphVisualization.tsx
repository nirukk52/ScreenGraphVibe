'use client';

import { useCallback } from 'react';
import ReactFlow, { Node, Edge, Controls, Background, NodeTypes, EdgeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import type { ScreenGraph, Screen, Action, Verb } from '../../../../shared/types';
import { ScreenNode } from './ScreenNode';
import { ActionEdge } from './ActionEdge';

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
};

const edgeTypes: EdgeTypes = {
  action: ActionEdge,
};

interface GraphVisualizationProps {
  graph: ScreenGraph | null;
  loading?: boolean;
}

export function GraphVisualization({ graph, loading = false }: GraphVisualizationProps) {
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
        y: Math.sin(index * 0.5) * 100,
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
      label: <ActionEdge data={{ action }} />,
    }));

    return { nodes, edges };
  }, []);

  const { nodes, edges } = graph ? getNodesAndEdges(graph) : { nodes: [], edges: [] };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Graph Data</h3>
          <p className="text-gray-600">Select a run to view its ScreenGraph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" data-testid="graph-visualization">
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
    </div>
  );
}
