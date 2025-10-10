'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScreenGraph, Screen, Action } from '../../../../shared/types';
import { Verb, Postcondition } from '../../../../shared/types';

type StartParams = { runId?: string; count?: number; intervalMs?: number };

export function useGraphEvents() {
  const [streamGraph, setStreamGraph] = useState<ScreenGraph | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>('');
  const esRef = useRef<EventSource | null>(null);

  const buildInitialGraph = useCallback((runId: string): ScreenGraph => ({
    graphId: 'mock-graph',
    appId: 'mock-app',
    runId,
    version: '0.1.0',
    createdAt: new Date().toISOString(),
    screens: [],
    actions: [],
    diffs: { addedScreens: [], removedScreens: [], addedActions: [], removedActions: [], changedActions: [] },
    counters: { screenCount: 0, actionCount: 0, interactiveCount: 0 },
    provenance: { extractionEngineVersion: 'mock', matcherVersion: 'mock', toleranceProfile: 'mock', jobId: 'mock', agentId: 'mock' },
  }), []);

  const startStream = useCallback((params: StartParams = {}) => {
    if (esRef.current) return;
    const runId = params.runId ?? 'mock-run';
    setStreamGraph(buildInitialGraph(runId));
    const count = params.count ?? 10;
    const intervalMs = params.intervalMs ?? 1000;
    const url = `/graph/events.sse?count=${count}&intervalMs=${intervalMs}&runId=${encodeURIComponent(runId)}`;
    const es = new EventSource(url);
    esRef.current = es;
    setIsStreaming(true);

    const upsertScreen = (nodeId: string, label?: string) => {
      setStreamGraph((prev) => {
        if (!prev) return prev;
        if (prev.screens.find((s) => s.screenId === nodeId)) return prev;
        const screen: Screen = {
          screenId: nodeId,
          role: 'screen',
          textStems: label ? [label] : [],
          artifacts: { screenshotUrl: '', pageSourceDigest: '', axDigest: '' },
          signature: { sketchHash: 'mock', layoutBucket: 'mock', screenshotCoarseHash: 'mock' },
          indexPath: `${prev.screens.length}`,
        };
        const next = { ...prev, screens: [...prev.screens, screen] };
        next.counters = { ...next.counters, screenCount: next.screens.length };
        return next;
      });
    };

    const addEdge = (from: string, to: string) => {
      setStreamGraph((prev) => {
        if (!prev) return prev;
        const action: Action = {
          actionId: `${from}->${to}-${prev.actions.length}`,
          fromScreenId: from,
          toScreenId: to,
          verb: Verb.TAP,
          targetRole: 'button',
          targetText: '',
          postcondition: Postcondition.ROUTE_CHANGE,
          signature: { verbPostconditionHash: 'mock' },
        };
        const next = { ...prev, actions: [...prev.actions, action] };
        next.counters = { ...next.counters, actionCount: next.actions.length };
        return next;
      });
    };

    es.onmessage = (evt) => {
      setLastEvent(evt.data);
    };
    es.addEventListener('graph.run.started', (evt) => setLastEvent(evt.type));
    es.addEventListener('graph.node.discovered', (evt) => {
      try {
        const payload = JSON.parse((evt as MessageEvent).data) as { nodeId: string; label?: string };
        upsertScreen(payload.nodeId, payload.label);
      } catch {}
    });
    es.addEventListener('graph.edge.created', (evt) => {
      try {
        const payload = JSON.parse((evt as MessageEvent).data) as { from: string; to: string };
        addEdge(payload.from, payload.to);
      } catch {}
    });
    es.addEventListener('graph.run.completed', () => {
      setIsStreaming(false);
      es.close();
      esRef.current = null;
    });
    es.addEventListener('error', () => {
      setIsStreaming(false);
      try { es.close(); } catch {}
      esRef.current = null;
    });
  }, [buildInitialGraph]);

  const stopStream = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => () => {
    if (esRef.current) esRef.current.close();
  }, []);

  return { streamGraph, isStreaming, lastEvent, startStream, stopStream };
}



