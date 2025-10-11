/**
 * @module UI/Management/PersonaManagement/PersonaList
 */
import React, { useEffect, useState } from 'react';

type PersonaLite = { id: string; name: string; role?: string };

export function PersonaList(): JSX.Element {
  const [items, setItems] = useState<PersonaLite[]>([]);

  const refresh = async () => {
    try {
      const res = await fetch('/management/personas');
      const data = await res.json();
      setItems(Array.isArray(data.personas) ? data.personas : []);
    } catch (_err) {
      setItems([]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSelect = (id: string) => {
    window.location.hash = `#persona:${id}`;
  };

  const onNew = () => {
    window.location.hash = '#persona:new';
  };

  return (
    <div className="rounded border p-4" data-testid="panel-personas">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Personas</h2>
        <button className="px-2 py-1 rounded border" onClick={onNew} data-testid="btn-new-persona">New</button>
      </div>
      <ul className="list-disc ml-5">
        {items.map(p => (
          <li key={p.id}>
            <button className="underline" data-testid={`persona-${p.id}`} onClick={() => onSelect(p.id)}>{p.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
