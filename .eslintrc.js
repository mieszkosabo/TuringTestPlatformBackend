module.exports = {
  extends: "erb",
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "import/no-cycle": "off",
    "react/jsx-props-no-spreading": "off",
    "react/display-name": "off",
    "import/extensions": "off",
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
};
