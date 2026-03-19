import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('manifest.json', 'utf8'))

execSync('npm run build', { stdio: 'inherit' })

execSync(
	`gh release create ${version} main.js manifest.json styles.css --title "${version}"`,
	{ stdio: 'inherit' },
)

console.log(`Released ${version}`)
