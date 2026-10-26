import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TOAST_DURATION, Toast } from './Toast';

describe('Toast', () => {
  it('タイトルとメッセージを表示する', () => {
    render(<Toast title="完了" message="保存しました" onHide={() => {}} />);

    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('保存しました')).toBeInTheDocument();
  });

  it('variant に応じたアイコンを表示する', () => {
    render(<Toast message="失敗しました" variant="error" onHide={() => {}} />);

    expect(screen.getByTestId('icon-CircleAlert')).toBeInTheDocument();
  });

  it('既定では閉じるボタンを表示しない', () => {
    render(<Toast message="保存しました" onHide={() => {}} />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('duration が null のときは閉じるボタンを表示し、押すと onHide が呼ばれる', async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();
    render(<Toast message="オフラインです" duration={null} onHide={onHide} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('showCloseButton が false のときは duration が null でも閉じるボタンを表示しない', () => {
    render(<Toast message="オフラインです" duration={null} showCloseButton={false} onHide={() => {}} />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('アクションを押すと onPress と onHide が呼ばれる', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const onHide = vi.fn();
    render(
      <Toast
        message="削除しました"
        duration={null}
        action={{ label: '元に戻す', onPress }}
        onHide={onHide}
      />,
    );

    await user.click(screen.getByRole('button', { name: '元に戻す' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  describe('自動で閉じる', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('既定では 3 秒後に onHide が呼ばれる', () => {
      const onHide = vi.fn();
      render(<Toast message="保存しました" onHide={onHide} />);

      act(() => vi.advanceTimersByTime(DEFAULT_TOAST_DURATION - 1));
      expect(onHide).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('duration を指定するとその時間後に onHide が呼ばれる', () => {
      const onHide = vi.fn();
      render(<Toast message="保存しました" duration={1000} onHide={onHide} />);

      act(() => vi.advanceTimersByTime(1000));

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('duration が null のときは時間が経っても onHide が呼ばれない', () => {
      const onHide = vi.fn();
      render(<Toast message="オフラインです" duration={null} onHide={onHide} />);

      act(() => vi.advanceTimersByTime(60_000));

      expect(onHide).not.toHaveBeenCalled();
    });
  });
});
