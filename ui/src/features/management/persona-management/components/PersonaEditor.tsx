/**
 * @module UI/Management/PersonaManagement/PersonaEditor
 */
import React, { useEffect, useState } from 'react';

type PersonaLite = { id: string; name: string; role?: string };

export function PersonaEditor(): JSX.Element {
  const [selected, setSelected] = useState<PersonaLite | null>(null);

  useEffect(() => {
    const handler = async () => {
      const hash = window.location.hash?.replace('#persona:', '');
      if (!hash) return setSelected(null);
      try {
        const res = await fetch('/management/personas');
        const data = await res.json();
        const found = (data.personas as PersonaLite[]).find(p => p.id === hash) || null;
        setSelected(found);
      } catch {
        setSelected(null);
      }
    };
    handler();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <div className="rounded border p-4" data-testid="panel-editor">
      <h2 className="font-medium mb-2" data-testid="editor-title">{selected ? selected.name : 'No persona selected'}</h2>
      {/* JSON schema form will be added in follow-ups */}
    </div>
  );
}
