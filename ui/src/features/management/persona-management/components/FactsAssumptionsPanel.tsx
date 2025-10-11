/**
 * @module UI/Management/PersonaManagement/FactsAssumptionsPanel
 * @description Editable table for facts and assumptions with add/remove.
 */
import React, { useState } from 'react';

type FactItem = { key: string; value: string };

export function FactsAssumptionsPanel(): JSX.Element {
  const [items, setItems] = useState<FactItem[]>([]);

  const addRow = () => {
    setItems(prev => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: 'key' | 'value', val: string) => {
    setItems(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  return (
    <div className="rounded border p-4" data-testid="panel-facts">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Facts & Assumptions</h2>
        <button className="px-2 py-1 rounded border" onClick={addRow} data-testid="btn-add-fact">Add</button>
      </div>
      <div className="space-y-2">
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
    </div>
  );
}

