/**
 * @module UI/Management/PersonaManagement/FactsAssumptionsPanel
 * @description Editable table for facts and assumptions with add/remove.
 */
import React, { useState } from 'react';

type FactItem = { key: string; value: string };

export function FactsAssumptionsPanel(): JSX.Element {
  const [items, setItems] = useState<FactItem[]>([]);
  const [status, setStatus] = useState<string>('');

  const addRow = () => {
    setItems(prev => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: 'key' | 'value', val: string) => {
    setItems(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

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
    const facts = items
      .map(({ key, value }) => ({ key: key.trim(), value: value.trim() }))
      .filter(({ key, value }) => key.length > 0 && value.length > 0);
    try {
      const res = await fetch(`http://localhost:3000/management/personas/${id}/facts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts }),
      });
      const data = await res.json();
      setStatus(data.updated ? 'Saved' : 'Saved (dry-run)');
      window.dispatchEvent(new CustomEvent('personas:changed'));
    } catch (_err) {
      setStatus('Error saving facts');
    }
  };

  return (
    <div className="rounded border p-4" data-testid="panel-facts" aria-labelledby="panel-facts-title">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium" id="panel-facts-title">Facts & Assumptions</h2>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded border" onClick={addRow} data-testid="btn-add-fact" aria-label="Add fact row">Add</button>
          <button className="px-2 py-1 rounded border" onClick={onSave} data-testid="btn-save-facts" aria-label="Save facts">Save</button>
        </div>
      </div>
      <div className="space-y-2" aria-labelledby="panel-facts-title">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2" data-testid={`fact-row-${idx}`}>
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Key"
              value={item.key}
              onChange={e => update(idx, 'key', e.target.value)}
              data-testid={`fact-key-${idx}`}
            />
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Value"
              value={item.value}
              onChange={e => update(idx, 'value', e.target.value)}
              data-testid={`fact-value-${idx}`}
            />
            <button
              className="px-2 py-1 rounded border"
              onClick={() => removeRow(idx)}
              data-testid={`btn-remove-${idx}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {status && <div className="mt-2 text-green-600" role="status" aria-live="polite" data-testid="facts-status">{status}</div>}
    </div>
  );
}

