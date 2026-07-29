import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', '_preview']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Without eslint-plugin-react, `no-unused-vars` cannot see an identifier
      // that is only referenced from JSX (`<Icon />`), so anything bound to a
      // capitalised name — imports, and destructured props holding a component
      // — is exempted. `args` needs the same allowance as `vars`: a component
      // pulled out of a `.map()` callback's parameter is an argument.
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]|^_' },
      ],
    },
  },
  {
    // Tests run under Node, not just in jsdom: they read fixture files off
    // disk and reach for `process` to resolve paths.
    files: ['src/tests/**/*.{js,jsx}', '*.config.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
])
