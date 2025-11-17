/* Root ESLint config applied to workspaces */
module.exports = {
  root: true,
  ignorePatterns: ["**/dist/**", "**/.expo/**", "**/build/**", "node_modules"],
  env: { node: true, es2022: true, jest: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "react", "react-hooks", "react-native", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "import/order": ["warn", { "newlines-between": "always" }]
  },
};
