import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThinkingPatternPanel } from '../ThinkingPatternPanel';

describe('ThinkingPatternPanel', () => {
  it('disables Save until BEFORE and AFTER are set', async () => {
    render(<ThinkingPatternPanel />);

    const save = screen.getByTestId('btn-save');
    expect(save).toBeDisabled();

    await userEvent.click(screen.getByTestId('toggle-before'));
    expect(save).toBeDisabled();

    await userEvent.click(screen.getByTestId('toggle-after'));
    expect(save).toBeEnabled();
  });
});
