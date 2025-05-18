// eslint.config.cjs
module.exports = {
  root: true,
    languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest' },
  },
  plugins: ['@typescript-eslint'],
  ignores: ['node_modules'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // your rules…
  }
};
