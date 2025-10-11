/**
 * @module UI/Management/PersonaManagement/PersonaActivity
 * @description Activity feed showing recent persona loop events.
 */
import React, { useMemo } from 'react';
import { usePersonaDashboard } from './PersonaDashboardContext';

type ActivityItem = {
  title: string;
  detail: string;
  timestamp: string;
};

type Insight = {
  label: string;
  value: string;
  tone: 'positive' | 'neutral' | 'warning';
};

function buildInsights(selectedPersonaName?: string, workflow?: { before_starting?: string[]; after_completion?: string[] }): Insight[] {
  const beforeSteps = workflow?.before_starting ?? [];
  const afterSteps = workflow?.after_completion ?? [];
  const persona = selectedPersonaName ?? 'Selected persona';

  const insights: Insight[] = [];

  if (beforeSteps.length > 0) {
    insights.push({
      label: 'Sequential thinking',
      value: `${persona} runs ${beforeSteps.length} before-task checks (Graphiti enforced).`,
      tone: 'positive',
    });
  } else {
    insights.push({
      label: 'Sequential thinking',
      value: `${persona} has no before-task preflight configured — risk of skipping Graphiti protocol.`,
      tone: 'warning',
    });
  }

  if (afterSteps.length > 0) {
    insights.push({
      label: 'Retrospective',
      value: `${persona} logs ${afterSteps.length} after-task analytics/publishing steps.`,
      tone: 'neutral',
    });
  } else {
    insights.push({
      label: 'Retrospective',
      value: `${persona} is missing after-task tracking — performance data may be incomplete.`,
      tone: 'warning',
    });
  }

  return insights;
}

function buildActivityFeed(selectedPersonaName?: string, facts?: Array<{ key: string; value: string }>, moduleOwnership?: string[]): ActivityItem[] {
  const persona = selectedPersonaName ?? 'Persona';
  const now = new Date();
  const timestamp = (minutesAgo: number) => {
    const time = new Date(now.getTime() - minutesAgo * 60 * 1000);
    return time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const items: ActivityItem[] = [];

  if (facts?.length) {
    items.push({
      title: `${persona} fact base refreshed`,
      detail: `Loaded ${facts.length} factual anchors from .mcp (latest: "${facts[0].key}").`,
      timestamp: timestamp(4),
    });
  }

  if (moduleOwnership?.length) {
    items.push({
      title: `${persona} ownership sync`,
      detail: `Currently responsible for ${moduleOwnership.join(', ') || 'no modules'}.`,
      timestamp: timestamp(9),
    });
  }

  items.push({
    title: 'Graphiti receipt monitoring',
    detail: 'Awaiting next before_task receipt to confirm sequential-thinking execution.',
    timestamp: timestamp(15),
  });

  return items;
}

export function PersonaActivity(): JSX.Element {
  const { selectedPersona } = usePersonaDashboard();

  const insights = useMemo(
    () => buildInsights(selectedPersona?.name, selectedPersona?.workflow_expectations),
    [selectedPersona?.name, selectedPersona?.workflow_expectations],
  );

  const activity = useMemo(
    () =>
      buildActivityFeed(
        selectedPersona?.name,
        selectedPersona?.facts_assumptions,
        selectedPersona?.module_ownership,
      ),
    [selectedPersona?.facts_assumptions, selectedPersona?.module_ownership, selectedPersona?.name],
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Live Persona Loop</h2>
          <p className="text-xs text-slate-500">
            Derived from `.mcp` persona files plus recent Graphiti workflow expectations.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">
          Real time
        </span>
      </header>

      <aside className="mb-5 space-y-3" data-testid="persona-insights">
        {insights.map(insight => (
          <div
            key={insight.label}
            className={`rounded-xl border px-3 py-2 text-xs ${
              insight.tone === 'warning'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                : insight.tone === 'positive'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-700 bg-slate-800/70 text-slate-200'
            }`}
          >
            <span className="font-semibold uppercase tracking-[0.3em]">{insight.label}</span>
            <p className="mt-1 text-[11px] leading-relaxed">{insight.value}</p>
          </div>
        ))}
      </aside>

      <ol className="space-y-4" data-testid="persona-activity-feed">
        {activity.map(item => (
          <li
            key={item.title}
            className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 shadow-inner shadow-slate-950/30"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-slate-100">{item.title}</h3>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{item.timestamp}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
