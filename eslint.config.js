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
        Buffer: 'readonly',
        createFragment: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['test/**/*'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'import/no-nodejs-modules': 'off',
    },
  },
  {
    rules: {
      'obsidianmd/ui/sentence-case': [
        'error',
        {
          enforceCamelCaseLower: true,
          ignoreWords: ['PDFs'],
          brands: [
            'iOS', 'iPadOS', 'macOS', 'Windows', 'Android', 'Linux',
            'Obsidian', 'Obsidian Sync', 'Obsidian Publish',
            'Google Drive', 'Dropbox', 'OneDrive', 'iCloud Drive',
            'YouTube', 'Slack', 'Discord', 'Telegram', 'WhatsApp', 'Twitter', 'X',
            'Readwise', 'Zotero', 'Excalidraw', 'Mermaid',
            'Markdown', 'LaTeX', 'JavaScript', 'TypeScript', 'Node.js',
            'npm', 'pnpm', 'Yarn', 'Git', 'GitHub', 'GitLab',
            'Notion', 'Evernote', 'Roam Research', 'Logseq', 'Anki', 'Reddit',
            'VS Code', 'Visual Studio Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm',
            // Project-specific brands
            'AI Attachmate', 'Attachmate', 'Gemini', 'Google', 'Canvas',
          ],
        },
      ],
    },
  },
]
