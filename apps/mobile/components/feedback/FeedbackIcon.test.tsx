import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { lightTheme } from '@/styles/themes';

import { FeedbackIcon } from './FeedbackIcon';

describe('FeedbackIcon', () => {
  it.each([
    ['info', 'Info'],
    ['success', 'CircleCheck'],
    ['warning', 'TriangleAlert'],
    ['error', 'CircleAlert'],
  ] as const)('variant が %s のときは %s アイコンを表示する', (variant, icon) => {
    render(<FeedbackIcon variant={variant} />);

    expect(screen.getByTestId(`icon-${icon}`)).toBeInTheDocument();
  });

  it('アイコンの色はテーマの accent 色になる', () => {
    render(<FeedbackIcon variant="success" />);

    expect(screen.getByTestId('icon-CircleCheck')).toHaveAttribute(
      'data-color',
      lightTheme.colors.feedback.success.accent,
    );
  });
});
