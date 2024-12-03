/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@babel/plugin-transform-class-static-block",
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          alias: {
            crypto: "react-native-quick-crypto",
            stream: "readable-stream",
            buffer: "@craftzdog/react-native-buffer",
          },
        },
      ],
    ],
  };
};
