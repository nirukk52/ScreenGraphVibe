/**
 * @module UI/Management/PersonaManagement/CodeownersPanel
 * @description CODEOWNERS preview/apply UI with basic fetch hooks.
 */
import React, { useState } from 'react';

const STATUS_APPLIED = 'Applied';
const STATUS_APPLIED_DRY_RUN = 'Applied (dry-run)';
const PREVIEW_DEFAULT = 'No preview loaded yet.';

export function CodeownersPanel(): JSX.Element {
  const [preview, setPreview] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const doPreview = async () => {
    setStatusMessage('');
    const res = await fetch('http://localhost:3000/management/codeowners/preview');
    const data = await res.json();
    setPreview(data.preview ?? '');
  };

  const doApply = async () => {
    setStatusMessage('Applying…');
    try {
      const res = await fetch('http://localhost:3000/management/codeowners/apply', { method: 'POST' });
      const data = await res.json();
      const message = data.applied ? STATUS_APPLIED : STATUS_APPLIED_DRY_RUN;
      setStatusMessage(message);
    } catch (_err) {
      setStatusMessage('Apply failed');
    }
  };

  return (
    <article
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
      data-testid="panel-codeowners"
      aria-labelledby="panel-codeowners-title"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200" id="panel-codeowners-title">CODEOWNERS</h2>
          <p className="text-xs text-slate-500">Preview and sync ownership rules so PRs auto-route.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Repository
        </span>
      </header>
      <div className="mb-3 flex gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/10" onClick={doPreview} data-testid="btn-preview" aria-label="Preview CODEOWNERS">
          Preview
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20" onClick={doApply} data-testid="btn-apply" aria-label="Apply CODEOWNERS">
          Apply
        </button>
      </div>
      <pre className="max-h-48 overflow-auto rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200" data-testid="preview-box" aria-labelledby="panel-codeowners-title">{preview || PREVIEW_DEFAULT}</pre>
      {statusMessage && <div className="mt-2 text-xs text-emerald-300" data-testid="apply-status" role="status" aria-live="polite">{statusMessage}</div>}
    </article>
  );
}

