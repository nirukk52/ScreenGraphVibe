import { render, screen, fireEvent } from '@testing-library/react';
import { ThinkingPatternPanel } from '../ThinkingPatternPanel';
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
      before_starting: [],
      after_completion: [],
    },
    facts_assumptions: [],
    module_ownership: [':backend'],
  },
  personaLoading: false,
  selectPersona: () => {},
  refreshPersonas: async () => {},
  refreshSelectedPersona: async () => {},
  updateSelectedPersona: () => {},
};

describe('ThinkingPatternPanel', () => {
  it('enables save only when before and after steps have values', () => {
    render(
      <PersonaDashboardContext.Provider value={mockContextValue}>
        <ThinkingPatternPanel />
      </PersonaDashboardContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('thinking-mode-toggle'));

    const save = screen.getByTestId('thinking-save');
    expect(save).toBeDisabled();

    const [addBefore, addAfter] = screen.getAllByText('Add step');

    fireEvent.click(addBefore);
    fireEvent.click(addAfter);

    const beforeInputs = screen.getAllByPlaceholderText('Describe the preflight step');
    fireEvent.change(beforeInputs[0], { target: { value: 'Break issue into sub-issues' } });

    const afterInputs = screen.getAllByPlaceholderText('Describe the after-task action');
    fireEvent.change(afterInputs[0], { target: { value: 'Log performance delta' } });

    expect(save).toBeEnabled();
  });
});
