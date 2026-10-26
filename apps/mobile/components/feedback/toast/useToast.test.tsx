import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';

describe('useToast', () => {
  it('ToastProvider の中では show / hide / hideAll を返す', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.show).toBeTypeOf('function');
    expect(result.current.hide).toBeTypeOf('function');
    expect(result.current.hideAll).toBeTypeOf('function');
  });

  it('ToastProvider の外で使うとエラーになる', () => {
    // React logs the error thrown during render; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider.');
  });
});
