import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

import { BannerOutlet, BannerScreenLayout } from './BannerOutlet';
import { BannerProvider, type BannerApi } from './BannerProvider';
import { useBanner } from './useBanner';

let api: BannerApi | undefined;

function CaptureBanner() {
  api = useBanner();
  return null;
}

function showBanner(options: Parameters<BannerApi['show']>[0]) {
  act(() => {
    api?.show(options);
  });
}

describe('BannerOutlet', () => {
  it('表示中の Banner がないときは何も表示しない', () => {
    render(
      <BannerProvider>
        <BannerOutlet />
      </BannerProvider>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('show された Banner を表示する', () => {
    render(
      <BannerProvider>
        <CaptureBanner />
        <BannerOutlet />
      </BannerProvider>,
    );

    showBanner({ title: 'お知らせ', message: 'メンテナンス予定があります。' });

    expect(screen.getByText('お知らせ')).toBeInTheDocument();
    expect(screen.getByText('メンテナンス予定があります。')).toBeInTheDocument();
  });

  it('閉じるボタンを押すと Banner を閉じて onDismiss を呼ぶ', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <BannerProvider>
        <CaptureBanner />
        <BannerOutlet />
      </BannerProvider>,
    );
    showBanner({ message: 'オフラインです', onDismiss });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('オフラインです')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('アクションを押すと onPress を呼んで Banner を閉じる', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <BannerProvider>
        <CaptureBanner />
        <BannerOutlet />
      </BannerProvider>,
    );
    showBanner({ message: 'メールが未確認です', actions: [{ label: '再送', onPress }] });

    await user.click(screen.getByRole('button', { name: '再送' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('メールが未確認です')).not.toBeInTheDocument();
  });

  it('複数の BannerOutlet に同じ Banner を表示する', () => {
    render(
      <BannerProvider>
        <CaptureBanner />
        <BannerOutlet />
        <BannerOutlet />
      </BannerProvider>,
    );

    showBanner({ message: 'オフラインです' });

    expect(screen.getAllByText('オフラインです')).toHaveLength(2);
  });
});

describe('BannerScreenLayout', () => {
  it('画面の内容を表示する', () => {
    render(
      <BannerProvider>
        <BannerScreenLayout>
          <Text>画面の内容</Text>
        </BannerScreenLayout>
      </BannerProvider>,
    );

    expect(screen.getByText('画面の内容')).toBeInTheDocument();
  });

  it('Banner を画面の内容より前に表示する', () => {
    render(
      <BannerProvider>
        <CaptureBanner />
        <BannerScreenLayout>
          <Text>画面の内容</Text>
        </BannerScreenLayout>
      </BannerProvider>,
    );

    showBanner({ message: 'オフラインです' });

    const banner = screen.getByText('オフラインです');
    const content = screen.getByText('画面の内容');
    expect(banner.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
