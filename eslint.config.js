import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import {
  defineConfig,
  globalIgnores
} from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: globals.browser,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
])