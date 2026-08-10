import { config as baseConfig } from "./base.js";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * A custom ESLint configuration for libraries that use React web.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const webConfig = [...baseConfig, ...jsxA11y.configs.recommended];
