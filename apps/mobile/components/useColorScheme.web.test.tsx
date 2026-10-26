import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useColorScheme } from './useColorScheme.web';

describe('useColorScheme (web)', () => {
  it('静的レンダリングと表示を一致させるため常に light を返す', () => {
    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });
});
