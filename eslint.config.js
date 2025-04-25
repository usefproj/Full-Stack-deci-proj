const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierFlat = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  // 1) Global ignore patterns (replaces .eslintignore)
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // 2) Apply rules only to your TS/TSX files
  {
    files: ['src/**/*.{ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      // Include all recommended TS rules
      ...tsPlugin.configs.recommended.rules,

      // Surface Prettier issues as ESLint errors
      'prettier/prettier': ['error'],

      // Your custom overrides
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },

    // Disable rules conflicting with Prettier
    ...prettierFlat,
  },
]);
