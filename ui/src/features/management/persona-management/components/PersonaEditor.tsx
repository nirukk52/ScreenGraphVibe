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
      const raw = window.location.hash?.replace('#persona:', '');
      if (!raw) {
        setSelected(null);
        setName('');
        setRole('');
        setStatus('');
        return;
      }
      if (raw === 'new') {
        setSelected({ id: 'new', name: '', role: '' });
        setName('');
        setRole('');
        setStatus('');
        return;
      }
      try {
        const res = await fetch('http://localhost:3000/management/personas');
        const data = await res.json();
        const found = (data.personas as PersonaLite[]).find(p => p.id === raw) || null;
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
    if (!isValid) return;
    if (!selected) return;
    if (selected.id === 'new') {
      const id = name.trim().toLowerCase().replace(/\s+/g, '_');
      const res = await fetch(`http://localhost:3000/management/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, role }),
      });
      const data = await res.json();
      setStatus(data.created ? 'Created' : 'Created (dry-run)');
      // notify other panels to refresh their data
      window.dispatchEvent(new CustomEvent('personas:changed'));
      // navigate to the new persona so editor picks it up
      window.location.hash = `#persona:${id}`;
      return;
    }
    const res = await fetch(`http://localhost:3000/management/personas/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    setStatus(data.updated ? 'Saved' : 'Saved (dry-run)');
    // notify other panels to refresh their data
    window.dispatchEvent(new CustomEvent('personas:changed'));
  };

  const onDelete = async () => {
    if (!selected || selected.id === 'new') return;
    const res = await fetch(`http://localhost:3000/management/personas/${selected.id}`, { method: 'DELETE' });
    const data = await res.json();
    setStatus(data.deleted ? 'Deleted' : 'Deleted (dry-run)');
    // notify other panels to refresh their data
    window.dispatchEvent(new CustomEvent('personas:changed'));
    // clear selection
    window.location.hash = '';
  };

  return (
    <div className="rounded border p-4" data-testid="panel-editor" aria-labelledby="panel-editor-title">
      <h2 className="font-medium mb-2" data-testid="editor-title" id="panel-editor-title">{selected ? (selected.id === 'new' ? 'New Persona' : selected.name) : 'No persona selected'}</h2>

      <div className="space-y-3">
        <label className="block text-sm" htmlFor="editor-name">
          <span className="block mb-1">Name</span>
          <input
            data-testid="editor-name"
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Persona name"
            id="editor-name"
            aria-describedby="panel-editor-title"
          />
        </label>

        <label className="block text-sm" htmlFor="editor-role">
          <span className="block mb-1">Role</span>
          <input
            data-testid="editor-role"
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Persona role"
            id="editor-role"
            aria-describedby="panel-editor-title"
          />
        </label>

        <div className="flex gap-3">
          <button
            data-testid="editor-save"
            type="button"
            disabled={!isValid}
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={onSave}
            aria-disabled={!isValid}
          >
            Save
          </button>
          <button
            data-testid="editor-delete"
            type="button"
            className="px-3 py-1 rounded border"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
        {status && <div data-testid="editor-status" className="text-green-600" role="status" aria-live="polite">{status}</div>}
      </div>
    </div>
  );
}

