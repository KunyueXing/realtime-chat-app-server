const js = require('@eslint/js')
const prettier = require('eslint-config-prettier')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals') // To define global variables for Node.js and Jest environments.

module.exports = [
  {
    // Specifies that the configuration applies to all .js files.
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        jest: true
      }
    },
    rules: {
      // 'no-console': 'warn',
      'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
      // Combines ESLint rules and Prettier configuration settings.
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }]
    }
  },
  js.configs.recommended,
  prettier,
  prettierRecommended
]
