// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // El plugin `import` no conoce por su cuenta el alias `@/*` de
    // tsconfig.json (`paths`) — necesita su propio resolver para no
    // marcar cada import con alias como no resuelto.
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    ignores: ["dist/*"],
  }
]);
