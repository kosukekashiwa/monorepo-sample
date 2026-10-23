module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          // Files under `app/` are always processed. Other files (e.g. `components/`)
          // are processed when they import from react-native-unistyles.
          root: 'app',
          autoProcessImports: ['react-native-unistyles'],
        },
      ],
    ],
  };
};
