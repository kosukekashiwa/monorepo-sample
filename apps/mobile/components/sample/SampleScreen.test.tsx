import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppChromeProvider } from '@/components/layout/app-chrome/AppChromeProvider';

import { SampleScreen } from './SampleScreen';

describe('SampleScreen', () => {
  it('タイトルを表示する', () => {
    render(
      <AppChromeProvider>
        <SampleScreen title="ホーム" />
      </AppChromeProvider>,
    );

    expect(screen.getByText('ホーム')).toBeInTheDocument();
  });

  it('既定では 30 行のダミー行を表示する', () => {
    render(
      <AppChromeProvider>
        <SampleScreen title="ホーム" />
      </AppChromeProvider>,
    );

    expect(screen.getAllByText(/^ホーム \d+$/)).toHaveLength(30);
  });

  it('rows で行数を指定できる', () => {
    render(
      <AppChromeProvider>
        <SampleScreen title="検索" rows={3} />
      </AppChromeProvider>,
    );

    expect(screen.getAllByText(/^検索 \d+$/).map((row) => row.textContent)).toEqual([
      '検索 1',
      '検索 2',
      '検索 3',
    ]);
  });
});
