/**
 * @module UI/Management/PersonaManagement/ModuleOwnershipPanel
 * @description Ownership toggles UI per module (local state stub).
 */
import React, { useMemo, useState } from 'react';
import { usePersonaDashboard } from './PersonaDashboardContext';

const MODULES = [':data', ':backend', ':ui', ':agent', ':infra'] as const;

type ModuleKey = typeof MODULES[number];

type OwnershipState = Record<ModuleKey, boolean>;

export function ModuleOwnershipPanel(): JSX.Element {
  const { selectedPersona, selectedId, updateSelectedPersona, refreshSelectedPersona } =
    usePersonaDashboard();
  const [ownership, setOwnership] = useState<OwnershipState>({
    ':data': false,
    ':backend': false,
    ':ui': false,
    ':agent': false,
    ':infra': false,
  });
  const [status, setStatus] = useState<string>('');

  useMemo(() => {
    const modules = selectedPersona?.module_ownership ?? [];
    setOwnership({
      ':data': modules.includes(':data'),
      ':backend': modules.includes(':backend'),
      ':ui': modules.includes(':ui'),
      ':agent': modules.includes(':agent'),
      ':infra': modules.includes(':infra'),
    });
    setStatus('');
  }, [selectedPersona?.module_ownership]);

  const toggle = (m: ModuleKey) => setOwnership(prev => ({ ...prev, [m]: !prev[m] }));

  const onSave = async () => {
    if (!selectedId || selectedId === 'new') {
      setStatus('Select a persona first');
      return;
    }
    const modules = Object.entries(ownership)
      .filter(([, owned]) => owned)
      .map(([key]) => key as ModuleKey);
    setStatus('Saving…');
    try {
      const res = await fetch(`http://localhost:3000/management/personas/${selectedId}/ownership`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      });
      const data = await res.json();
      setStatus(data.updated ? 'Ownership saved' : 'Ownership saved (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
      await refreshSelectedPersona();
      updateSelectedPersona(prev =>
        prev ? { ...prev, module_ownership: modules } : prev,
      );
    } catch (_err) {
      setStatus('Error saving ownership');
    }
  };

  return (
    <article
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-ownership"
      aria-labelledby="panel-ownership-title"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200" id="panel-ownership-title">Module Ownership</h2>
          <p className="text-xs text-slate-500">Toggle modules to reinforce accountability loops.</p>
          {status && <p className="mt-1 text-xs text-emerald-300" role="status" aria-live="polite" data-testid="ownership-status">{status}</p>}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Ownership
        </span>
      </header>
      <ul className="space-y-3">
        {MODULES.map(moduleKey => (
          <li key={moduleKey} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/30">
            <label className="inline-flex items-center gap-3" htmlFor={`own-${moduleKey.replace(':', '')}`}>
              <input
                type="checkbox"
                checked={ownership[moduleKey]}
                onChange={() => toggle(moduleKey)}
                data-testid={`own-${moduleKey.replace(':', '')}`}
                id={`own-${moduleKey.replace(':', '')}`}
                aria-labelledby="panel-ownership-title"
                className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-400 focus:ring-emerald-500"
              />
              <span className="font-medium">{moduleKey}</span>
            </label>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
              {ownership[moduleKey] ? 'Assigned' : 'Open'}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          onClick={onSave}
          data-testid="btn-save-ownership"
          aria-label="Save module ownership"
        >
          Save
        </button>
      </div>
    </article>
  );
}

