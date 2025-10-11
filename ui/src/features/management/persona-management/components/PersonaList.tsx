/**
 * @module UI/Management/PersonaManagement/PersonaList
 */
import React, { useEffect, useState } from 'react';

type PersonaLite = { id: string; name: string; role?: string };

export function PersonaList(): JSX.Element {
  const [items, setItems] = useState<PersonaLite[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/management/personas');
        const data = await res.json();
        setItems(Array.isArray(data.personas) ? data.personas : []);
      } catch (_err) {
        setItems([]);
      }
    })();
  }, []);

  const onSelect = (id: string) => {
    window.location.hash = `#persona:${id}`;
  };

  return (
    <div className="rounded border p-4" data-testid="panel-personas">
      <h2 className="font-medium mb-2">Personas</h2>
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
