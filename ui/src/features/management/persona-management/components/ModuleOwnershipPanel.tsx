/**
 * @module UI/Management/PersonaManagement/ModuleOwnershipPanel
 * @description Ownership toggles UI per module (local state stub).
 */
import React, { useState } from 'react';

const MODULES = [':data', ':backend', ':ui', ':agent', ':infra'] as const;

type ModuleKey = typeof MODULES[number];

type OwnershipState = Record<ModuleKey, boolean>;

export function ModuleOwnershipPanel(): JSX.Element {
  const [ownership, setOwnership] = useState<OwnershipState>({
    ':data': false,
    ':backend': false,
    ':ui': false,
    ':agent': false,
    ':infra': false,
  });
  const [status, setStatus] = useState<string>('');

  const toggle = (m: ModuleKey) =>
    setOwnership(prev => ({ ...prev, [m]: !prev[m] }));

  const getSelectedPersonaId = (): string | null => {
    const raw = window.location.hash?.replace('#persona:', '') || '';
    if (!raw || raw === 'new') return null;
    return raw;
  };

  const onSave = async () => {
    setStatus('');
    const id = getSelectedPersonaId();
    if (!id) {
      setStatus('Select a persona first');
      return;
    }
    const modules = Object.entries(ownership)
      .filter(([, owned]) => owned)
      .map(([k]) => k);
    try {
      const res = await fetch(`http://localhost:3000/management/personas/${id}/ownership`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      });
      const data = await res.json();
      setStatus(data.updated ? 'Saved' : 'Saved (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
    } catch (_err) {
      setStatus('Error saving ownership');
    }
  };

  return (
    <div className="rounded border p-4" data-testid="panel-ownership" aria-labelledby="panel-ownership-title">
      <h2 className="font-medium mb-2" id="panel-ownership-title">Module Ownership</h2>
      <ul className="space-y-2">
        {MODULES.map(m => (
          <li key={m} className="flex items-center gap-3">
            <label className="flex items-center gap-2" htmlFor={`own-${m.replace(':', '')}`}>
              <input
                type="checkbox"
                checked={ownership[m]}
                onChange={() => toggle(m)}
                data-testid={`own-${m.replace(':', '')}`}
                id={`own-${m.replace(':', '')}`}
                aria-labelledby="panel-ownership-title"
              />
              <span>{m}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        <button className="px-2 py-1 rounded border" onClick={onSave} data-testid="btn-save-ownership" aria-label="Save module ownership">Save</button>
        {status && <span className="text-green-600" role="status" aria-live="polite" data-testid="ownership-status">{status}</span>}
      </div>
    </div>
  );
}

