/**
 * @module UI/Management/PersonaManagement/PersonaDashboardContext
 * @description Shared context + provider for persona dashboard state and actions.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type PersonaLite = { id: string; name: string; role?: string };

export type PersonaFact = { key: string; value: string };

type GraphitiProtocol = {
  before_task: {
    graph_id: string;
    role_node: string;
    fetch_last: number;
    where: string;
    detect: string[];
    on_failure: string;
  };
  after_task: Record<string, unknown>;
};

export type PersonaWorkflow = {
  before_starting: string[];
  after_completion: string[];
};

export type PersonaDetail = {
  persona_id: string;
  name: string;
  role: string;
  version?: string;
  summary?: string;
  graphiti_protocol: GraphitiProtocol;
  facts_assumptions?: PersonaFact[];
  module_ownership?: string[];
  workflow_expectations?: PersonaWorkflow;
  [key: string]: unknown;
};

type PersonaDashboardContextValue = {
  personas: PersonaLite[];
  personasLoading: boolean;
  selectedId: string | null;
  selectedPersona: PersonaDetail | null;
  personaLoading: boolean;
  selectPersona: (id: string | null) => void;
  refreshPersonas: () => Promise<void>;
  refreshSelectedPersona: () => Promise<void>;
  updateSelectedPersona: (updater: (prev: PersonaDetail | null) => PersonaDetail | null) => void;
};

export const PersonaDashboardContext = createContext<PersonaDashboardContextValue | undefined>(
  undefined,
);

const PERSONA_ROUTE_BASE = 'http://localhost:3000/management/personas';

function normalizeHash(rawHash: string): string | null {
  if (!rawHash) return null;
  const trimmed = rawHash.replace('#', '');
  if (!trimmed.startsWith('persona:')) return null;
  const value = trimmed.replace('persona:', '').trim();
  return value.length > 0 ? value : null;
}

async function fetchPersonas(): Promise<PersonaLite[]> {
  const res = await fetch(PERSONA_ROUTE_BASE);
  const data = await res.json();
  const list = Array.isArray(data.personas) ? data.personas : [];
  return list.map((p: Record<string, unknown>) => ({
    id: String(p.id ?? p.persona_id ?? ''),
    name: String(p.name ?? ''),
    role: typeof p.role === 'string' ? p.role : undefined,
  }));
}

async function fetchPersonaDetail(id: string): Promise<PersonaDetail> {
  const res = await fetch(`${PERSONA_ROUTE_BASE}/${id}`);
  if (res.status === 404) {
    throw new Error('persona_not_found');
  }
  const data = await res.json();
  return data.persona as PersonaDetail;
}

export function PersonaDashboardProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [personas, setPersonas] = useState<PersonaLite[]>([]);
  const [personasLoading, setPersonasLoading] = useState<boolean>(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDetail | null>(null);
  const [personaLoading, setPersonaLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const initialisedRef = useRef<boolean>(false);

  const loadPersonas = useCallback(async () => {
    setPersonasLoading(true);
    try {
      const list = await fetchPersonas();
      setPersonas(list);
    } finally {
      setPersonasLoading(false);
    }
  }, []);

  const loadPersonaById = useCallback(async (id: string) => {
    setPersonaLoading(true);
    try {
      const detail = await fetchPersonaDetail(id);
      setSelectedPersona(detail);
      setSelectedId(id);
    } catch (err) {
      setSelectedPersona(null);
      setSelectedId(null);
      if ((err as Error).message !== 'persona_not_found') {
        // eslint-disable-next-line no-console
        console.error('Failed to load persona', err);
      }
    } finally {
      setPersonaLoading(false);
    }
  }, []);

  const applyHashSelection = useCallback(
    (incomingHash?: string) => {
      const hashValue = normalizeHash(incomingHash ?? window.location.hash);
      if (!hashValue) {
        setSelectedId(null);
        setSelectedPersona(null);
        return;
      }
      if (hashValue === 'new') {
        setSelectedId('new');
        setSelectedPersona(null);
        setPersonaLoading(false);
        return;
      }
      loadPersonaById(hashValue).catch(() => {
        /* handled in loadPersonaById */
      });
    },
    [loadPersonaById],
  );

  useEffect(() => {
    loadPersonas().catch(() => {
      /* ignore */
    });
  }, [loadPersonas]);

  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    applyHashSelection();
    const handleHash = () => applyHashSelection();
    const handlePersonasChanged = () => {
      loadPersonas().catch(() => {
        /* ignore */
      });
      if (selectedId && selectedId !== 'new') {
        loadPersonaById(selectedId).catch(() => {
          /* ignore */
        });
      }
    };
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('personas:changed', handlePersonasChanged);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('personas:changed', handlePersonasChanged);
    };
  }, [applyHashSelection, loadPersonaById, loadPersonas, selectedId]);

  useEffect(() => {
    if (personasLoading) return;
    if (selectedId && selectedId !== 'new') return;
    const hashValue = normalizeHash(window.location.hash);
    if (hashValue) return;
    if (personas.length === 0) return;
    const first = personas[0];
    window.location.hash = `#persona:${first.id}`;
  }, [personas, personasLoading, selectedId]);

  const selectPersona = useCallback((id: string | null) => {
    if (!id) {
      window.location.hash = '';
      return;
    }
    window.location.hash = `#persona:${id}`;
  }, []);

  const refreshPersonas = useCallback(async () => {
    await loadPersonas();
  }, [loadPersonas]);

  const refreshSelectedPersona = useCallback(async () => {
    if (!selectedId || selectedId === 'new') return;
    await loadPersonaById(selectedId);
  }, [loadPersonaById, selectedId]);

  const updateSelectedPersona = useCallback(
    (updater: (prev: PersonaDetail | null) => PersonaDetail | null) => {
      setSelectedPersona(prev => updater(prev));
    },
    [],
  );

  const value = useMemo<PersonaDashboardContextValue>(
    () => ({
      personas,
      personasLoading,
      selectedId,
      selectedPersona,
      personaLoading,
      selectPersona,
      refreshPersonas,
      refreshSelectedPersona,
      updateSelectedPersona,
    }),
    [
      personas,
      personasLoading,
      selectedId,
      selectedPersona,
      personaLoading,
      selectPersona,
      refreshPersonas,
      refreshSelectedPersona,
      updateSelectedPersona,
    ],
  );

  return (
    <PersonaDashboardContext.Provider value={value}>{children}</PersonaDashboardContext.Provider>
  );
}

export function usePersonaDashboard(): PersonaDashboardContextValue {
  const context = useContext(PersonaDashboardContext);
  if (!context) {
    throw new Error('usePersonaDashboard must be used within PersonaDashboardProvider');
  }
  return context;
}

