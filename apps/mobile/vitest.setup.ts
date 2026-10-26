import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, vi } from 'vitest';

import './styles/unistyles';

// lucide-react-native depends on react-native-svg, whose CommonJS build requires the
// Flow sources of react-native. Render each icon as a plain element instead, tagged
// with the icon name (e.g. `icon-House`) so tests can tell which icon is shown.
vi.mock('lucide-react-native', () => {
  const icons = new Map<string, unknown>();
  const isIconName = (name: string | symbol): name is string =>
    typeof name === 'string' && /^[A-Z]/.test(name);
  return new Proxy(
    {},
    {
      has: (_, name) => isIconName(name),
      get: (_, name) => {
        if (!isIconName(name)) {
          return undefined;
        }
        if (!icons.has(name)) {
          icons.set(name, ({ color }: { color?: string }) =>
            createElement('span', { 'data-testid': `icon-${name}`, 'data-color': color }),
          );
        }
        return icons.get(name);
      },
    },
  );
});

afterEach(() => {
  cleanup();
});
