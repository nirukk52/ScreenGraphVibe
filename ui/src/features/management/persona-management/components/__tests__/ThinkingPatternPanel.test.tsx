import { render, screen, fireEvent } from '@testing-library/react';
import { ThinkingPatternPanel } from '../ThinkingPatternPanel';

describe('ThinkingPatternPanel', () => {
  it('disables Save until BEFORE and AFTER are set', async () => {
    render(<ThinkingPatternPanel />);

    const save = screen.getByTestId('btn-save');
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByTestId('toggle-before'));
    expect(save).toBeDisabled();

    fireEvent.click(screen.getByTestId('toggle-after'));
    expect(save).toBeEnabled();
  });
});
