import config from '@cycraft/eslint/config'
import obsidianmd from 'eslint-plugin-obsidianmd'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
	{ ignores: ['node_modules/', 'main.js', 'eslint.config.js'] },
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
]
