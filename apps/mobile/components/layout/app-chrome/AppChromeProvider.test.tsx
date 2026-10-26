import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { AppChromeProvider } from './AppChromeProvider';
import { useAppChrome } from './useAppChrome';

const wrapper = ({ children }: { children: ReactNode }) => <AppChromeProvider>{children}</AppChromeProvider>;

describe('AppChromeProvider', () => {
  it('初期状態ではヘッダーとフッタを表示する状態になっている', () => {
    const { result } = renderHook(() => useAppChrome(), { wrapper });

    expect(result.current.hidden.value).toBe(false);
    expect(result.current.progress.value).toBe(0);
  });

  it('初期状態では上下の余白は 0', () => {
    const { result } = renderHook(() => useAppChrome(), { wrapper });

    expect(result.current.topInset).toBe(0);
    expect(result.current.bottomInset).toBe(0);
  });

  it('setTopInset / setBottomInset で上下の余白を更新する', () => {
    const { result } = renderHook(() => useAppChrome(), { wrapper });

    act(() => {
      result.current.setTopInset(120);
      result.current.setBottomInset(80);
    });

    expect(result.current.topInset).toBe(120);
    expect(result.current.bottomInset).toBe(80);
  });

  it('show を呼ぶと隠れていたヘッダーとフッタを表示する状態に戻す', async () => {
    const { result } = renderHook(() => useAppChrome(), { wrapper });
    act(() => {
      result.current.hidden.value = true;
      result.current.progress.value = 1;
    });

    act(() => {
      result.current.show();
    });

    expect(result.current.hidden.value).toBe(false);
    await waitFor(() => expect(result.current.progress.value).toBe(0));
  });
});
