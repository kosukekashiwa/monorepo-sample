import { act, render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ToastApi } from './ToastProvider';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

/** Renders a ToastProvider and returns the API exposed by useToast. */
function renderWithToast() {
  let api: ToastApi | undefined;
  function Capture() {
    api = useToast();
    return <Text>画面</Text>;
  }
  render(
    <ToastProvider>
      <Capture />
    </ToastProvider>,
  );
  return () => {
    if (!api) {
      throw new Error('useToast was not called');
    }
    return api;
  };
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('子要素を表示する', () => {
    renderWithToast();

    expect(screen.getByText('画面')).toBeInTheDocument();
  });

  it('show で Toast を表示する', () => {
    const toast = renderWithToast();

    act(() => {
      toast().show({ message: '保存しました' });
    });

    expect(screen.getByText('保存しました')).toBeInTheDocument();
  });

  it('show は Toast ごとに異なる id を返す', () => {
    const toast = renderWithToast();

    let ids: string[] = [];
    act(() => {
      ids = [toast().show({ message: '1' }), toast().show({ message: '2' })];
    });

    expect(ids[0]).not.toBe(ids[1]);
  });

  it('新しい Toast を上に積む', () => {
    const toast = renderWithToast();

    act(() => {
      toast().show({ message: 'Toast 1', duration: null });
      toast().show({ message: 'Toast 2', duration: null });
    });

    const [first, second] = screen.getAllByText(/^Toast \d$/);
    expect(first).toHaveTextContent('Toast 2');
    expect(second).toHaveTextContent('Toast 1');
  });

  it('4 件以上表示すると一番古い Toast から消える', () => {
    const toast = renderWithToast();

    act(() => {
      for (let i = 1; i <= 5; i++) {
        toast().show({ message: `Toast ${i}`, duration: null });
      }
    });

    expect(screen.getAllByText(/^Toast \d$/).map((element) => element.textContent)).toEqual([
      'Toast 5',
      'Toast 4',
      'Toast 3',
    ]);
  });

  it('hide で指定した Toast だけを消す', () => {
    const toast = renderWithToast();

    act(() => {
      const id = toast().show({ message: '消える', duration: null });
      toast().show({ message: '残る', duration: null });
      toast().hide(id);
    });

    expect(screen.queryByText('消える')).not.toBeInTheDocument();
    expect(screen.getByText('残る')).toBeInTheDocument();
  });

  it('hideAll ですべての Toast を消す', () => {
    const toast = renderWithToast();

    act(() => {
      toast().show({ message: '1', duration: null });
      toast().show({ message: '2', duration: null });
      toast().hideAll();
    });

    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('duration が経過した Toast は自動で消える', () => {
    const toast = renderWithToast();

    act(() => {
      toast().show({ message: '保存しました', duration: 1000 });
    });
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.queryByText('保存しました')).not.toBeInTheDocument();
  });
});
