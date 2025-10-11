import { render, screen } from '@testing-library/react';
import { PersonaSummary } from '../PersonaSummary';
import { PersonaDashboardContext } from '../PersonaDashboardContext';

const mockContextValue = {
  personas: [{ id: 'rino_senior', name: 'Rino', role: 'Engineer' }],
  personasLoading: false,
  selectedId: 'rino_senior',
  selectedPersona: {
    persona_id: 'rino_senior',
    name: 'Rino',
    role: 'Engineer',
    graphiti_protocol: {
      before_task: {
        graph_id: 'screengraph-vibe',
        role_node: 'Rino',
        fetch_last: 10,
        where: '',
        detect: [],
        on_failure: '',
      },
      after_task: {},
    },
    workflow_expectations: {
      before_starting: ['Run sequential thinking MCP'],
      after_completion: ['Log performance delta'],
    },
  },
  personaLoading: false,
  selectPersona: () => {},
  refreshPersonas: async () => {},
  refreshSelectedPersona: async () => {},
  updateSelectedPersona: () => {},
};

describe('PersonaSummary', () => {
  it('renders KPI cards based on persona dashboard context', () => {
    render(
      <PersonaDashboardContext.Provider value={mockContextValue}>
        <PersonaSummary />
      </PersonaDashboardContext.Provider>,
    );

    expect(screen.getByTestId('metric-personas')).toHaveTextContent('1');
    expect(screen.getByTestId('metric-sequential-thinking')).toHaveTextContent('100%');
    expect(screen.getByTestId('metric-performance-logs')).toHaveTextContent('On');
  });
});
