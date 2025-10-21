import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output and e2e tests in lint
  globalIgnores(['dist', 'tests/e2e/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Temporary: relax explicit any to unblock development; we will type these gradually
      '@typescript-eslint/no-explicit-any': 'off',
      // Treat unused vars as warnings and ignore underscore-prefixed ones
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Disable strict export-only-components rule to avoid blocking on context files
      'react-refresh/only-export-components': 'off',
    },
  },
])
