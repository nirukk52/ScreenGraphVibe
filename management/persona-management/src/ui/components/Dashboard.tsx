/**
 * @module UI/Management/PersonaManagement/Dashboard
 * @description High-level dashboard layout with modular panels.
 */
import React from 'react';
import { PersonaList } from './PersonaList';
import { PersonaEditor } from './PersonaEditor';
import { ThinkingPatternPanel } from './ThinkingPatternPanel';
import { FactsAssumptionsPanel } from './FactsAssumptionsPanel';
import { ModuleOwnershipPanel } from './ModuleOwnershipPanel';
import { CodeownersPanel } from './CodeownersPanel';
import { PersonaSummary } from './PersonaSummary';
import { PersonaActivity } from './PersonaActivity';
import { PersonaDashboardProvider } from './PersonaDashboardContext';

export function Dashboard(): JSX.Element {
  return (
    <PersonaDashboardProvider>
      <main
        className="min-h-screen bg-slate-950 text-slate-100"
        data-testid="persona-dashboard"
        role="main"
        aria-labelledby="persona-dashboard-title"
      >
        <section className="relative isolate overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-12 shadow-xl">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                  Persona Flight Deck
                </span>
                <div className="space-y-3">
                  <h1
                    className="text-3xl font-semibold tracking-tight text-slate-50 drop-shadow-lg sm:text-4xl"
                    data-testid="title"
                    id="persona-dashboard-title"
                  >
                    Shape every agent into a high-impact teammate
                  </h1>
                  <p className="max-w-2xl text-base text-slate-400">
                    Monitor thinking patterns, validate assumptions, and orchestrate module ownership so agents evolve with every cycle.
                    Updates push directly into `.mcp` persona files for a real-time Graphiti loop.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    Graphiti synced
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                    Sequential thinking enforced
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400"></span>
                    Performance tracked
                  </span>
                </div>
              </div>
              <PersonaSummary />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
          <div className="flex w-full flex-col gap-8 lg:w-1/3">
            <PersonaActivity />
            <PersonaList />
          </div>
          <div className="flex w-full flex-col gap-8 lg:w-2/3">
            <PersonaEditor />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ThinkingPatternPanel />
              <FactsAssumptionsPanel />
              <ModuleOwnershipPanel />
              <CodeownersPanel />
            </div>
          </div>
        </section>
      </main>
    </PersonaDashboardProvider>
  );
}

