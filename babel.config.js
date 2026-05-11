module.exports = function (api) {
  // O Expo usa o Babel para converter o JavaScript moderno em um formato
  // entendido pelo ambiente do aplicativo.
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
  };
};
