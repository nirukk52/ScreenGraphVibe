/**
 * @module UI/Management/PersonaManagement/PersonaEditor
 */
import React, { useEffect, useMemo, useState } from 'react';

type PersonaLite = { id: string; name: string; role?: string };

export function PersonaEditor(): JSX.Element {
  const [selected, setSelected] = useState<PersonaLite | null>(null);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const handler = async () => {
      const hash = window.location.hash?.replace('#persona:', '');
      if (!hash) {
        setSelected(null);
        setName('');
        setRole('');
        setStatus('');
        return;
      }
      try {
        const res = await fetch('/management/personas');
        const data = await res.json();
        const found = (data.personas as PersonaLite[]).find(p => p.id === hash) || null;
        setSelected(found);
        setName(found?.name ?? '');
        setRole(found?.role ?? '');
        setStatus('');
      } catch {
        setSelected(null);
        setName('');
        setRole('');
        setStatus('');
      }
    };
    handler();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const isValid = useMemo(() => name.trim().length > 0 && role.trim().length > 0, [name, role]);

  const onSave = async () => {
    if (!selected) return;
    const res = await fetch(`/management/personas/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    setStatus(data.updated ? 'Saved' : 'Saved (dry-run)');
  };

  return (
    <div className="rounded border p-4" data-testid="panel-editor">
      <h2 className="font-medium mb-2" data-testid="editor-title">{selected ? selected.name : 'No persona selected'}</h2>

      <div className="space-y-3">
        <label className="block text-sm">
          <span className="block mb-1">Name</span>
          <input
            data-testid="editor-name"
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Persona name"
          />
        </label>

        <label className="block text-sm">
          <span className="block mb-1">Role</span>
          <input
            data-testid="editor-role"
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Persona role"
          />
        </label>

        <button
          data-testid="editor-save"
          type="button"
          disabled={!isValid}
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={onSave}
        >
          Save
        </button>
        {status && <div data-testid="editor-status" className="text-green-600">{status}</div>}
      </div>
    </div>
  );
}
