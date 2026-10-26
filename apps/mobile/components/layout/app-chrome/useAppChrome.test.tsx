import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppChromeProvider } from './AppChromeProvider';
import { useAppChrome } from './useAppChrome';

describe('useAppChrome', () => {
  it('AppChromeProvider の中では表示状態と操作を返す', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppChromeProvider>{children}</AppChromeProvider>
    );

    const { result } = renderHook(() => useAppChrome(), { wrapper });

    expect(result.current.progress).toBeDefined();
    expect(result.current.show).toBeTypeOf('function');
  });

  it('AppChromeProvider の外で使うとエラーになる', () => {
    // React logs the error thrown during render; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useAppChrome())).toThrow(
      'useAppChrome must be used within an AppChromeProvider.',
    );
  });
});
