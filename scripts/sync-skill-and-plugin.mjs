#!/usr/bin/env node
/**
 * Sync pure utility files from src/utils/ into the ai-attachmate skill folder.
 *
 * Usage:
 *   node scripts/sync-skill-and-plugin.mjs           # copy with DO-NOT-EDIT banner
 *   node scripts/sync-skill-and-plugin.mjs --check   # exit 1 if synced copies are stale
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

const FILES = ['applyTemplate.ts', 'canvasToMd.ts', 'blockUtils.ts', 'fileUtils.ts', 'constants.ts']

const SRC_DIR = join(repoRoot, 'src/utils')
const DEST_DIR = join(repoRoot, 'skills/ai-attachmate/scripts/_synced')

const BANNER =
	'// AUTO-GENERATED — DO NOT EDIT.\n' +
	'// Edit src/utils/<file>.ts in the obsidian-ai-attachmate repo and run `npm run sync-skill`.\n\n'

function bannered(content) {
	return BANNER + content
}

const checkMode = process.argv.includes('--check')
let drift = false

if (!checkMode) {
	mkdirSync(DEST_DIR, { recursive: true })
}

for (const file of FILES) {
	const src = readFileSync(join(SRC_DIR, file), 'utf8')
	const expected = bannered(src)
	const destPath = join(DEST_DIR, file)

	if (checkMode) {
		if (!existsSync(destPath)) {
			console.error(`stale: ${destPath} is missing`)
			drift = true
			continue
		}
		const actual = readFileSync(destPath, 'utf8')
		if (actual !== expected) {
			console.error(`stale: ${destPath} differs from src/utils/${file}`)
			drift = true
		}
	} else {
		writeFileSync(destPath, expected)
		console.log(`synced: ${file}`)
	}
}

if (checkMode && drift) {
	console.error('\nSynced copies are out of date. Run `npm run sync-skill`.')
	process.exit(1)
}
