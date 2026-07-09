module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource:"nativewind" handles the NativeWind JSX transform.
      // Do NOT add "nativewind/babel" here — it tries to re-apply
      // @babel/plugin-transform-react-jsx which conflicts with the hoisted
      // version resolved by pnpm, causing ".plugins is not a valid Plugin property".
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // Required by react-native-reanimated v4 / nativewind for worklets support
      "react-native-worklets/plugin",
      ["@babel/plugin-transform-private-methods", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
    ],
  };
};