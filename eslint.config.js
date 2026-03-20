import config from '@cycraft/eslint/config'
import obsidianmd from 'eslint-plugin-obsidianmd'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  { ignores: ['node_modules/', 'main.js'] },
  ...config,
  ...tseslint.config(...obsidianmd.configs.recommended),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
