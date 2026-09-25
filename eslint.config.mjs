// ESLint flat config for the whole repo (backend, frontend, scripts). Formatting is Prettier's job.
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // Node: backend, build scripts, config files.
  {
    files: [
      'backend/**/*.js',
      'scripts/**/*.mjs',
      'frontend/scripts/**/*.mjs',
      '*.config.{js,mjs}',
      'frontend/*.config.js',
    ],
    languageOptions: { globals: globals.node },
  },

  // Browser + React: frontend source.
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off', // small app, no TypeScript: props are documented with JSDoc instead
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Tests (Vitest imports its APIs explicitly; jsdom/node globals as appropriate).
  {
    files: ['**/*.test.{js,jsx}', '**/test/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },

  prettier,
]
