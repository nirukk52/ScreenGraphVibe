/**
 * @module UI/Management/PersonaManagement/PersonaEditor
 */
import React, { useEffect, useMemo, useState } from 'react';
import { usePersonaDashboard, PersonaDetail } from './PersonaDashboardContext';

const DEFAULT_WORKFLOW: PersonaDetail['workflow_expectations'] = {
  before_starting: [],
  after_completion: [],
};

export function PersonaEditor(): JSX.Element {
  const {
    selectedPersona,
    selectedId,
    personaLoading,
    updateSelectedPersona,
    refreshSelectedPersona,
  } = usePersonaDashboard();
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!selectedPersona) {
      setName('');
      setRole('');
      setStatus('');
      return;
    }
    setName(selectedPersona.name ?? '');
    setRole(selectedPersona.role ?? '');
    setStatus('');
  }, [selectedPersona]);

  const isValid = useMemo(() => name.trim().length > 0 && role.trim().length > 0, [name, role]);

  const onSave = async () => {
    if (!isValid) return;
    if (!selectedId) return;
    if (selectedId === 'new') {
      const id = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
      const res = await fetch(`http://localhost:3000/management/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, role }),
      });
      const data = await res.json();
      setStatus(data.created ? 'Created' : 'Created (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
      window.location.hash = `#persona:${id}`;
      return;
    }
    const res = await fetch(`http://localhost:3000/management/personas/${selectedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    setStatus(data.updated ? 'Saved' : 'Saved (dry-run)');
    window.dispatchEvent(new CustomEvent('personas:changed'));
    await refreshSelectedPersona();
  };

  const onDelete = async () => {
    if (!selectedId || selectedId === 'new') return;
    const res = await fetch(`http://localhost:3000/management/personas/${selectedId}`, { method: 'DELETE' });
    const data = await res.json();
    setStatus(data.deleted ? 'Deleted' : 'Deleted (dry-run)');
    window.dispatchEvent(new CustomEvent('personas:changed'));
    window.location.hash = '';
  };

  const workflow = selectedPersona?.workflow_expectations ?? DEFAULT_WORKFLOW;

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-editor"
      aria-labelledby="panel-editor-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-200" data-testid="editor-title" id="panel-editor-title">
            {selectedId
              ? selectedId === 'new'
                ? 'Create Persona'
                : selectedPersona?.name ?? selectedId
              : 'No persona selected'}
          </h2>
          <p className="text-xs text-slate-500">Changes write directly to `.mcp` persona files and trigger Graphiti sync.</p>
          {personaLoading && <p className="mt-1 text-xs text-slate-500">Loading persona details…</p>}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-400">
          Editor
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm" htmlFor="editor-name">
          <span className="text-slate-300">Name</span>
          <input
            data-testid="editor-name"
            type="text"
            className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Persona name"
            id="editor-name"
            aria-describedby="panel-editor-title"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm" htmlFor="editor-role">
          <span className="text-slate-300">Role</span>
          <input
            data-testid="editor-role"
            type="text"
            className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Persona role"
            id="editor-role"
            aria-describedby="panel-editor-title"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Before task (sequential thinking preflight)</h3>
          <ul className="mt-2 space-y-2 text-xs text-slate-400" data-testid="workflow-before">
            {workflow.before_starting.length === 0 && (
              <li className="italic text-slate-500">No before-starting steps configured.</li>
            )}
            {workflow.before_starting.map(step => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">After task (retrospective actions)</h3>
          <ul className="mt-2 space-y-2 text-xs text-slate-400" data-testid="workflow-after">
            {workflow.after_completion.length === 0 && (
              <li className="italic text-slate-500">No after-completion steps configured.</li>
            )}
            {workflow.after_completion.map(step => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          data-testid="editor-save"
          type="button"
          disabled={!isValid || personaLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition enabled:hover:border-emerald-400 enabled:hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onSave}
          aria-disabled={!isValid || personaLoading}
        >
          Save persona
        </button>
        <button
          data-testid="editor-delete"
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200"
          onClick={onDelete}
          aria-label={`Delete ${selectedPersona?.name || 'persona'}`}
        >
          Delete
        </button>
        {status && (
          <div data-testid="editor-status" className="text-sm text-emerald-300" role="status" aria-live="polite">
            {status}
          </div>
        )}
      </div>
    </section>
  );
}

