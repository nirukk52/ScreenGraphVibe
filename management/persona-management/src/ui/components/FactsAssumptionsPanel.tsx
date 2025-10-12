/**
 * @module UI/Management/PersonaManagement/FactsAssumptionsPanel
 * @description Editable table for facts and assumptions with add/remove.
 */
import React, { useMemo, useState } from 'react';
import { usePersonaDashboard, PersonaFact } from './PersonaDashboardContext';

export function FactsAssumptionsPanel(): JSX.Element {
  const { selectedPersona, selectedId, updateSelectedPersona, refreshSelectedPersona } =
    usePersonaDashboard();
  const [status, setStatus] = useState<string>('');
  const [items, setItems] = useState<PersonaFact[]>([]);

  useMemo(() => {
    if (!selectedPersona?.facts_assumptions) {
      setItems([]);
      return;
    }
    setItems(selectedPersona.facts_assumptions.map(({ key, value }) => ({ key, value })));
    setStatus('');
  }, [selectedPersona?.facts_assumptions]);

  const addRow = () => {
    setItems(prev => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: 'key' | 'value', val: string) => {
    setItems(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const onSave = async () => {
    if (!selectedId || selectedId === 'new') return;
    const facts = items
      .map(({ key, value }) => ({ key: key.trim(), value: value.trim() }))
      .filter(({ key, value }) => key.length > 0 && value.length > 0);
    setStatus('Saving…');
    try {
      const res = await fetch(`http://localhost:3000/management/personas/${selectedId}/facts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts }),
      });
      const data = await res.json();
      setStatus(data.updated ? 'Facts saved' : 'Facts saved (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
      await refreshSelectedPersona();
      updateSelectedPersona(prev =>
        prev
          ? {
              ...prev,
              facts_assumptions: facts,
            }
          : prev,
      );
    } catch (err) {
      setStatus(`Error saving facts: ${(err as Error).message}`);
    }
  };

  return (
    <article
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-facts"
      aria-labelledby="panel-facts-title"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200" id="panel-facts-title">Facts &amp; Assumptions</h2>
          <p className="text-xs text-slate-500">Capture critical context for the persona and sync to `.mcp`.</p>
          {status && (
            <p className="mt-1 text-xs text-emerald-300" data-testid="facts-status" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/10" onClick={addRow} data-testid="btn-add-fact" aria-label="Add fact row">
            Add Row
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20" onClick={onSave} data-testid="btn-save-facts" aria-label="Save facts">
            Save
          </button>
        </div>
      </header>
      <div className="space-y-3" aria-labelledby="panel-facts-title">
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm transition hover:border-emerald-500/30 sm:grid-cols-[1fr_1fr_auto]" data-testid={`fact-row-${idx}`}>
            <input
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Key"
              value={item.key}
              onChange={e => update(idx, 'key', e.target.value)}
              data-testid={`fact-key-${idx}`}
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="Value"
              value={item.value}
              onChange={e => update(idx, 'value', e.target.value)}
              data-testid={`fact-value-${idx}`}
            />
            <button
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-500/20 hover:text-rose-200"
              onClick={() => removeRow(idx)}
              data-testid={`btn-remove-${idx}`}
              aria-label={`Remove fact row ${idx + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-xs text-slate-500">
            Add facts or assumptions so agents can align on reality before executing.
          </div>
        )}
      </div>
    </article>
  );
}

