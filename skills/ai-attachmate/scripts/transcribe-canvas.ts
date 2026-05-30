#!/usr/bin/env tsx
/**
 * transcribe-canvas.ts <vault-relative-canvas-path-or-absolute>
 *
 * Reads a .canvas file and emits the converted Markdown to stdout.
 * No AI needed — canvas conversion is fully deterministic.
 *
 * Typical use:
 *   tsx transcribe-canvas.ts /abs/vault/path/to/foo.canvas |
 *     tsx write-transcript.ts --vault ... --source ... --target ... --canvas
 */

import { readFileSync, existsSync } from 'fs'
import { convertCanvasToMd } from './_synced/canvasToMd'

function main(): void {
	const path = process.argv[2]
	if (!path) {
		console.error('Usage: transcribe-canvas.ts <canvas-file-path>')
		process.exit(2)
	}
	if (!existsSync(path)) {
		console.error(`File not found: ${path}`)
		process.exit(2)
	}
	const content = readFileSync(path, 'utf8')
	process.stdout.write(convertCanvasToMd(content))
}

main()
