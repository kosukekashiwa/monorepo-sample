import { renderHook } from '@testing-library/react';
import * as ReactNative from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Import the native implementation explicitly: the test setup resolves `./useColorScheme`
// to the `.web.ts` variant, as Metro does for the web platform.
import { useColorScheme } from './useColorScheme.ts';

describe('useColorScheme (native)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['light', 'dark'] as const)('OS の設定が %s のときはそのまま返す', (scheme) => {
    vi.spyOn(ReactNative, 'useColorScheme').mockReturnValue(scheme);

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe(scheme);
  });

  it('OS の設定が取得できないときは light を返す', () => {
    vi.spyOn(ReactNative, 'useColorScheme').mockReturnValue('unspecified');

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });
});
