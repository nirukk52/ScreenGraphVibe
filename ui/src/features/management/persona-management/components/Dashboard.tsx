/**
 * @module UI/Management/PersonaManagement/Dashboard
 * @description High-level dashboard layout with modular panels.
 */
import React from 'react';
import { ThinkingPatternPanel } from './ThinkingPatternPanel';
import { FactsAssumptionsPanel } from './FactsAssumptionsPanel';
import { ModuleOwnershipPanel } from './ModuleOwnershipPanel';
import { CodeownersPanel } from './CodeownersPanel';
import { PersonaList } from './PersonaList';
import { PersonaEditor } from './PersonaEditor';

export function Dashboard(): JSX.Element {
  return (
    <main className="p-6 space-y-6" data-testid="persona-dashboard">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold" data-testid="title">Persona Management</h1>
        <p className="text-sm text-gray-500">Manage personas, thinking patterns, facts, assumptions, and module ownership.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonaList />
        <PersonaEditor />
        <ThinkingPatternPanel />
        <FactsAssumptionsPanel />
        <ModuleOwnershipPanel />
        <CodeownersPanel />
      </section>
    </main>
  );
}

