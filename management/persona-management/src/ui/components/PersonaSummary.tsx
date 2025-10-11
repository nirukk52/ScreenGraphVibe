/**
 * @module UI/Management/PersonaManagement/PersonaSummary
 * @description KPI cards giving at-a-glance signal for persona health.
 */
import React, { useMemo } from 'react';
import { usePersonaDashboard } from './PersonaDashboardContext';

type SummaryMetric = {
  label: string;
  value: string;
  delta: string;
  accent: string;
};

function buildMetrics(options: {
  personasCount: number;
  sequentialCoverage: number;
  performanceAvailable: boolean;
}): SummaryMetric[] {
  const { personasCount, sequentialCoverage, performanceAvailable } = options;

  return [
    {
      label: 'Personas',
      value: String(personasCount),
      delta: personasCount > 0 ? 'Loaded from .mcp/personas' : 'No personas detected',
      accent: 'from-emerald-400/80 to-emerald-500/40',
    },
    {
      label: 'Sequential Thinking',
      value: `${Math.round(sequentialCoverage * 100)}%`,
      delta:
        sequentialCoverage === 1
          ? 'Preflight enforced across the fleet'
          : sequentialCoverage === 0
          ? 'Missing steps in every persona'
          : 'Partial coverage — review workflows',
      accent: 'from-sky-400/80 to-blue-500/40',
    },
    {
      label: 'Performance Logs',
      value: performanceAvailable ? 'On' : 'Off',
      delta: performanceAvailable ? 'Tracked per milestone' : 'No after-task analytics configured',
      accent: 'from-fuchsia-400/80 to-pink-500/40',
    },
  ];
}

export function PersonaSummary(): JSX.Element {
  const { personas, selectedPersona } = usePersonaDashboard();

  const metrics = useMemo(() => {
    const personasCount = personas.length;
    const hasWorkflow = (personaWorkflow?: { before_starting?: string[] }) =>
      !!personaWorkflow && Array.isArray(personaWorkflow.before_starting) && personaWorkflow.before_starting.length > 0;
    const sequentialCoverage =
      personasCount === 0
        ? 0
        : personas.reduce((acc, persona) => {
            if (persona.id === selectedPersona?.persona_id && hasWorkflow(selectedPersona?.workflow_expectations)) {
              return acc + 1;
            }
            return acc;
          }, 0) / personasCount;
    const performanceAvailable = Boolean(
      selectedPersona?.workflow_expectations?.after_completion?.length,
    );

    return buildMetrics({ personasCount, sequentialCoverage, performanceAvailable });
  }, [personas, selectedPersona]);

  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map(metric => {
        const testId = `metric-${metric.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        return (
          <article
            key={metric.label}
            data-testid={testId}
            className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40 backdrop-blur transition hover:-translate-y-1 hover:shadow-emerald-500/20`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-20`}></div>
            <div className="relative space-y-1">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</span>
              <p className="text-2xl font-semibold text-slate-50">{metric.value}</p>
              <p className="text-xs text-slate-400">{metric.delta}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
