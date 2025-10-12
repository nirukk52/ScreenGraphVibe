/**
 * @module UI/Management/PersonaManagement/ThinkingPatternPanel
 * @description BEFORE/AFTER management with required toggles (data driven).
 */
import React, { useMemo, useState } from 'react';
import { usePersonaDashboard } from './PersonaDashboardContext';

type EditorState = {
  before_starting: string[];
  after_completion: string[];
};

type Mode = 'view' | 'edit';

function ensureWorkflow(values?: string[]): string[] {
  if (!Array.isArray(values)) return [];
  return values.map(v => String(v)).filter(v => v.trim().length > 0);
}

export function ThinkingPatternPanel(): JSX.Element {
  const { selectedPersona, selectedId, updateSelectedPersona, refreshSelectedPersona } =
    usePersonaDashboard();
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState<EditorState>(() => ({
    before_starting: ensureWorkflow(selectedPersona?.workflow_expectations?.before_starting),
    after_completion: ensureWorkflow(selectedPersona?.workflow_expectations?.after_completion),
  }));
  const [status, setStatus] = useState<string>('');

  useMemo(() => {
    if (!selectedPersona) {
      setDraft({ before_starting: [], after_completion: [] });
      setMode('view');
      return;
    }
    setDraft({
      before_starting: ensureWorkflow(selectedPersona.workflow_expectations?.before_starting),
      after_completion: ensureWorkflow(selectedPersona.workflow_expectations?.after_completion),
    });
    setMode('view');
  }, [selectedPersona]);

  const isReady = draft.before_starting.length > 0 && draft.after_completion.length > 0;

  const addEntry = (section: keyof EditorState) => {
    setDraft(prev => ({ ...prev, [section]: [...prev[section], ''] }));
  };

  const updateEntry = (section: keyof EditorState, index: number, value: string) => {
    setDraft(prev => ({
      ...prev,
      [section]: prev[section].map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const removeEntry = (section: keyof EditorState, index: number) => {
    setDraft(prev => ({
      ...prev,
      [section]: prev[section].filter((_, idx) => idx !== index),
    }));
  };

  const saveWorkflow = async () => {
    if (!selectedId || selectedId === 'new') return;
    const payload = {
      workflow_expectations: {
        before_starting: draft.before_starting.map(step => step.trim()).filter(Boolean),
        after_completion: draft.after_completion.map(step => step.trim()).filter(Boolean),
      },
    };
    setStatus('Saving…');
    try {
      const res = await fetch(`http://localhost:3000/management/personas/${selectedId}/workflow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStatus(data.updated ? 'Workflow saved' : 'Workflow saved (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
      await refreshSelectedPersona();
      updateSelectedPersona(prev =>
        prev
          ? {
              ...prev,
              workflow_expectations: payload.workflow_expectations,
            }
          : prev,
      );
      setMode('view');
    } catch (err) {
      setStatus(`Error saving workflow: ${(err as Error).message}`);
    }
  };

  const currentWorkflow = selectedPersona?.workflow_expectations;

  return (
    <article
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-thinking"
      aria-labelledby="panel-thinking-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200" id="panel-thinking-title">
            Thinking Pattern (BEFORE/AFTER)
          </h2>
          <p className="text-xs text-slate-500">
            Visualise and adjust the sequential thinking steps each persona must follow before and after every task.
          </p>
          {status && (
            <p className="mt-1 text-xs text-emerald-300" data-testid="thinking-status" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </div>
        {selectedId && selectedId !== 'new' && (
          <button
            type="button"
            onClick={() => setMode(prev => (prev === 'view' ? 'edit' : 'view'))}
            className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
            data-testid="thinking-mode-toggle"
          >
            {mode === 'view' ? 'Edit' : 'View'}
          </button>
        )}
      </header>

      {mode === 'view' ? (
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Before starting</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {currentWorkflow?.before_starting?.length ? (
                currentWorkflow.before_starting.map(step => (
                  <li key={step} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-500">
                  No before-starting steps defined.
                </li>
              )}
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">After completion</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {currentWorkflow?.after_completion?.length ? (
                currentWorkflow.after_completion.map(step => (
                  <li key={step} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-500">
                  No after-completion steps defined.
                </li>
              )}
            </ul>
          </section>
        </div>
      ) : (
        <div className="space-y-6" data-testid="thinking-editor">
          <section>
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Before starting</h3>
              <button
                type="button"
                onClick={() => addEntry('before_starting')}
                className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
              >
                Add step
              </button>
            </header>
            <div className="mt-2 space-y-3">
              {draft.before_starting.length === 0 && (
                <p className="text-xs text-slate-500">Add at least one step to enforce sequential thinking.</p>
              )}
              {draft.before_starting.map((step, index) => (
                <div key={`${index}-${step}`} className="flex gap-2">
                  <input
                    value={step}
                    onChange={e => updateEntry('before_starting', index, e.target.value)}
                    placeholder="Describe the preflight step"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry('before_starting', index)}
                    className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-slate-200 hover:border-rose-400/40 hover:text-rose-200"
                    aria-label={`Remove before step ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">After completion</h3>
              <button
                type="button"
                onClick={() => addEntry('after_completion')}
                className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
              >
                Add step
              </button>
            </header>
            <div className="mt-2 space-y-3">
              {draft.after_completion.length === 0 && (
                <p className="text-xs text-slate-500">Add retrospective steps to ensure agents learn and report.</p>
              )}
              {draft.after_completion.map((step, index) => (
                <div key={`${index}-${step}`} className="flex gap-2">
                  <input
                    value={step}
                    onChange={e => updateEntry('after_completion', index, e.target.value)}
                    placeholder="Describe the after-task action"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry('after_completion', index)}
                    className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-slate-200 hover:border-rose-400/40 hover:text-rose-200"
                    aria-label={`Remove after step ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!isReady}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 transition enabled:hover:border-emerald-400 enabled:hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="thinking-save"
              onClick={saveWorkflow}
            >
              Save workflow
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 hover:border-slate-500"
              onClick={() => {
                setDraft({
                  before_starting: ensureWorkflow(currentWorkflow?.before_starting),
                  after_completion: ensureWorkflow(currentWorkflow?.after_completion),
                });
                setMode('view');
              }}
            >
              Cancel
            </button>
            <span
              className={`${isReady ? 'text-emerald-300' : 'text-rose-300'} text-xs uppercase tracking-[0.25em]`}
              data-testid="status-valid"
              role="status"
              aria-live="polite"
            >
              {isReady ? 'Ready' : 'Incomplete'}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

