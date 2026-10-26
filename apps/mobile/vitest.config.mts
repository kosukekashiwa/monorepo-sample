import { transformAsync } from '@babel/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runs the Babel plugins the app build relies on over the app's own files: Unistyles (same
 * options as babel.config.js) and Reanimated's worklets plugin (added by babel-preset-expo).
 * On web, Unistyles needs its plugin to turn `StyleSheet.create` styles into CSS classes;
 * without it no styles reach the DOM. TypeScript and JSX are only parsed here and compiled by Vite.
 *
 * The plugin turns itself off when NODE_ENV is "test" (which Vitest sets), so it is
 * created while NODE_ENV is temporarily switched to "development".
 */
function babelPlugins(): Plugin {
  return {
    name: 'app-babel-plugins',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0] ?? id;
      if (!/\.[jt]sx?$/.test(file) || file.includes('/node_modules/') || !file.startsWith(root)) {
        return null;
      }
      const nodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const result = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        parserOpts: { plugins: ['jsx', 'typescript'] },
        plugins: [
          ['react-native-unistyles/plugin', { root: 'app', autoProcessImports: ['react-native-unistyles'] }],
          'react-native-worklets/plugin',
        ],
      }).finally(() => {
        process.env.NODE_ENV = nodeEnv;
      });
      return result?.code ? { code: result.code, map: result.map } : null;
    },
  };
}

/**
 * Reanimated's js-reanimated/webUtils loads react-native-web helpers with `require`, which
 * silently fails once Vite processes Reanimated as an ES module, and animated styles then
 * never reach the DOM. Point it at a shim that imports the same helpers.
 */
function reanimatedWebUtils(): Plugin {
  return {
    name: 'reanimated-web-utils',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        source === './webUtils' &&
        importer?.includes('/react-native-reanimated/') &&
        importer.includes('/js-reanimated/')
      ) {
        return path.join(root, 'test/reanimatedWebUtils.ts');
      }
      return null;
    },
  };
}

// Components are tested on top of react-native-web in jsdom, so DOM-based
// Testing Library and user-event can be used.
export default defineConfig({
  plugins: [babelPlugins(), reanimatedWebUtils()],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' },
      // Its `main` is a CommonJS build that requires react-native directly; use the ES module build.
      {
        find: /^react-native-safe-area-context$/,
        replacement: 'react-native-safe-area-context/lib/module/index.js',
      },
      { find: /^@\//, replacement: `${root}/` },
    ],
    // Prefer the web implementations (`*.web.*`) the same way Metro does for the web platform.
    extensions: ['.web.tsx', '.web.ts', '.web.mjs', '.web.js', '.tsx', '.ts', '.mjs', '.js', '.jsx', '.json'],
  },
  define: {
    __DEV__: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.polyfills.ts', './vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', '.expo/**'],
    server: {
      deps: {
        // Transform these through Vite so the aliases and web extensions above apply inside them.
        inline: [
          /react-native-unistyles/,
          /react-native-reanimated/,
          /react-native-safe-area-context/,
          /react-native-worklets/,
        ],
      },
    },
  },
});
