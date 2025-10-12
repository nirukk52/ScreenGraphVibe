/**
 * @module UI/Management/PersonaManagement/PersonaList
 */
import React from 'react';
import { usePersonaDashboard } from './PersonaDashboardContext';

export function PersonaList(): JSX.Element {
  const { personas, personasLoading, selectPersona, selectedId } = usePersonaDashboard();

  const onNew = () => selectPersona('new');

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-personas"
      aria-labelledby="panel-personas-title"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200" id="panel-personas-title">Personas</h2>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-200"
          onClick={onNew}
          data-testid="btn-new-persona"
          aria-label="Create new persona"
        >
          <span className="text-lg leading-none">＋</span>
          New
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Select an agent to review assumptions, ownership, and performance.</p>
      <div className="mt-4">
        {personasLoading ? (
          <p className="text-xs text-slate-500">Loading personas…</p>
        ) : personas.length === 0 ? (
          <p className="text-xs text-slate-500">No personas found in `.mcp/personas`.</p>
        ) : (
          <ul className="space-y-2" aria-labelledby="panel-personas-title">
            {personas.map(persona => {
              const isActive = selectedId === persona.id;
              return (
                <li key={persona.id}>
                  <button
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                        : 'border-transparent bg-slate-950/60 text-slate-200 hover:border-emerald-500/40 hover:bg-slate-900'
                    }`}
                    data-testid={`persona-${persona.id}`}
                    onClick={() => selectPersona(persona.id)}
                  >
                    <span className="font-medium">{persona.name}</span>
                    {persona.role && <span className="text-xs text-slate-500">{persona.role}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

