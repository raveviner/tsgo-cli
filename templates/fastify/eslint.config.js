/**
 * ESLint flat configuration file
 * This config uses the new ESLint flat config format and provides:
 * - TypeScript support with strict type checking
 * - Import/export validation and ordering
 * - Prettier integration for consistent formatting
 *
 * @see {@link https://eslint.org/docs/latest/use/configure/configuration-files-new} for flat config documentation
 * @see {@link https://typescript-eslint.io/getting-started/typed-linting} for TypeScript-ESLint docs
 * @see {@link https://github.com/import-js/eslint-plugin-import} for import plugin options
 */

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';

/** @type {import('eslint').Linter.Config[]} */
export default [
  /**
   * Global ignores configuration
   * Excludes directories that should never be linted
   */
  {
    ignores: ['node_modules/', 'dist/'],
  },
  /**
   * TypeScript-specific configuration
   * Sets up parsing, type checking, and TS-specific rules
   */
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].rules,
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'warn',
      // Import rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/export': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-mutable-exports': 'error',
      'import/no-duplicates': 'error',
    },
  },
  /**
   * Prettier integration
   * Must be last in the config array to properly override other style rules
   * @see {@link https://github.com/prettier/eslint-plugin-prettier} for documentation
   */
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
];
