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

  const toggle = (m: ModuleKey) =>
    setOwnership(prev => ({ ...prev, [m]: !prev[m] }));

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
    </div>
  );
}

