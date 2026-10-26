import { act, render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';

import { BannerOutlet } from './BannerOutlet';
import { BannerProvider, type BannerApi } from './BannerProvider';
import { useBanner } from './useBanner';

/** Renders a BannerProvider with a BannerOutlet and returns the API exposed by useBanner. */
function renderWithBanner() {
  let api: BannerApi | undefined;
  function Capture() {
    api = useBanner();
    return <Text>画面</Text>;
  }
  render(
    <BannerProvider>
      <BannerOutlet />
      <Capture />
    </BannerProvider>,
  );
  return () => {
    if (!api) {
      throw new Error('useBanner was not called');
    }
    return api;
  };
}

describe('BannerProvider', () => {
  it('子要素を表示する', () => {
    renderWithBanner();

    expect(screen.getByText('画面')).toBeInTheDocument();
  });

  it('show を呼ぶまでは Banner を表示しない', () => {
    renderWithBanner();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('show で Banner を表示する', () => {
    const banner = renderWithBanner();

    act(() => {
      banner().show({ message: 'オフラインです' });
    });

    expect(screen.getByText('オフラインです')).toBeInTheDocument();
  });

  it('show を続けて呼ぶと表示中の Banner を置き換える', () => {
    const banner = renderWithBanner();

    act(() => {
      banner().show({ message: '1 件目' });
      banner().show({ message: '2 件目' });
    });

    expect(screen.queryByText('1 件目')).not.toBeInTheDocument();
    expect(screen.getByText('2 件目')).toBeInTheDocument();
  });

  it('hide を引数なしで呼ぶと Banner を閉じる', () => {
    const banner = renderWithBanner();

    act(() => {
      banner().show({ message: 'オフラインです' });
      banner().hide();
    });

    expect(screen.queryByText('オフラインです')).not.toBeInTheDocument();
  });

  it('hide に表示中の Banner の id を渡すと閉じる', () => {
    const banner = renderWithBanner();

    act(() => {
      const id = banner().show({ message: 'オフラインです' });
      banner().hide(id);
    });

    expect(screen.queryByText('オフラインです')).not.toBeInTheDocument();
  });

  it('hide に置き換え済みの Banner の id を渡しても表示中の Banner は閉じない', () => {
    const banner = renderWithBanner();

    act(() => {
      const oldId = banner().show({ message: '古い Banner' });
      banner().show({ message: '新しい Banner' });
      banner().hide(oldId);
    });

    expect(screen.getByText('新しい Banner')).toBeInTheDocument();
  });
});
