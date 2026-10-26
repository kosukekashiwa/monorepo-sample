import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BannerProvider } from './BannerProvider';
import { useBanner } from './useBanner';

describe('useBanner', () => {
  it('BannerProvider の中では show / hide を返す', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <BannerProvider>{children}</BannerProvider>;

    const { result } = renderHook(() => useBanner(), { wrapper });

    expect(result.current.show).toBeTypeOf('function');
    expect(result.current.hide).toBeTypeOf('function');
  });

  it('BannerProvider の外で使うとエラーになる', () => {
    // React logs the error thrown during render; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useBanner())).toThrow('useBanner must be used within a BannerProvider.');
  });
});
