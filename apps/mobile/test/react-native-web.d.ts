// react-native-web's internal modules used by test/reanimatedWebUtils.ts ship without types.
declare module 'react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle' {
  const createReactDOMStyle: (style: unknown) => unknown;
  export default createReactDOMStyle;
}

declare module 'react-native-web/dist/exports/StyleSheet/preprocess' {
  export const createTransformValue: (transform: unknown) => unknown;
  export const createTextShadowValue: (style: unknown) => void | string;
}
