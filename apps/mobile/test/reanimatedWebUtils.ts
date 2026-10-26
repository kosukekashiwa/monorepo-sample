// Replacement for react-native-reanimated's js-reanimated/webUtils in tests.
// The original loads these react-native-web helpers with `require` inside try/catch, which
// silently fails when Vite processes Reanimated as an ES module. Without them Reanimated
// cannot write animated styles to the DOM. See vitest.config.mts.
export { default as createReactDOMStyle } from 'react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle';
export {
  createTextShadowValue,
  createTransformValue,
} from 'react-native-web/dist/exports/StyleSheet/preprocess';
