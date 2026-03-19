import { execSync } from 'child_process'
import { copyFileSync, readFileSync } from 'fs'
import { join } from 'path'

const vaultPath = process.argv[2]

if (!vaultPath) {
	console.error('missing folder path, pass the path to your local obsidian vault as second param.')
	process.exit(1)
}

const { id } = JSON.parse(readFileSync('manifest.json', 'utf8'))
const dest = join(vaultPath, '.obsidian', 'plugins', id)

execSync('npm run build', { stdio: 'inherit' })

for (const file of ['main.js', 'manifest.json', 'styles.css']) {
	copyFileSync(file, join(dest, file))
}

console.log(`Installed to ${dest}`)
