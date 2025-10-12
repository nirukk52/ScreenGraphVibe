/**
 * @module PersonaManagement/UI
 * @description UI components barrel export for persona dashboard
 */
export { Dashboard } from './components/Dashboard';
export { PersonaList } from './components/PersonaList';
export { PersonaEditor } from './components/PersonaEditor';
export { ThinkingPatternPanel } from './components/ThinkingPatternPanel';
export { FactsAssumptionsPanel } from './components/FactsAssumptionsPanel';
export { ModuleOwnershipPanel } from './components/ModuleOwnershipPanel';
export { CodeownersPanel } from './components/CodeownersPanel';
export { PersonaSummary } from './components/PersonaSummary';
export { PersonaActivity } from './components/PersonaActivity';
export {
  PersonaDashboardProvider,
  usePersonaDashboard,
  type PersonaDetail,
  type PersonaLite,
  type PersonaFact,
  type PersonaWorkflow,
} from './components/PersonaDashboardContext';

