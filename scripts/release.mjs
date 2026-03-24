#!/usr/bin/env node
/**
 * Release script — bumps version, builds, tests, commits, and publishes a GitHub release.
 *
 * Usage:
 *   node scripts/release.mjs                # interactive: asks for bump type
 *   node scripts/release.mjs --bump patch   # non-interactive: patch | minor | major
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { createInterface } from 'readline/promises'

// ─── helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
	return execSync(cmd, { stdio: 'inherit', ...opts })
}

function capture(cmd) {
	return execSync(cmd, { encoding: 'utf8' }).trim()
}

function readJson(path) {
	return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, data) {
	writeFileSync(path, JSON.stringify(data, null, '\t') + '\n')
}

function bumpVersion(version, type) {
	const [major, minor, patch] = version.split('.').map(Number)
	if (type === 'major') return `${major + 1}.0.0`
	if (type === 'minor') return `${major}.${minor + 1}.0`
	return `${major}.${minor}.${patch + 1}`
}

function abort(msg) {
	console.error(`\n✗ ${msg}`)
	process.exit(1)
}

// ─── parse args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const bumpIdx = args.indexOf('--bump')
const bumpArg =
	args.find((a) => a.startsWith('--bump='))?.split('=')[1] ??
	(bumpIdx !== -1 ? args[bumpIdx + 1] : null)

if (bumpArg && !['patch', 'minor', 'major'].includes(bumpArg)) {
	abort(`--bump must be patch, minor, or major (got: ${bumpArg})`)
}

// ─── 1. git sanity checks ─────────────────────────────────────────────────────

console.log('\n● Checking git status…')

const status = capture('git status --porcelain')
if (status) abort(`Uncommitted changes detected:\n${status}`)

run('git fetch origin')

const behind = capture('git rev-list HEAD..origin/main --count')
if (behind !== '0') abort(`Branch is ${behind} commit(s) behind origin/main. Pull first.`)

const ahead = capture('git rev-list origin/main..HEAD --count')
if (ahead !== '0') abort(`Branch is ${ahead} commit(s) ahead of origin/main. Push first.`)

console.log('  ✓ git is clean and up to date')

// ─── 2. current versions ──────────────────────────────────────────────────────

const pkg = readJson('package.json')
const currentVersion = pkg.version

const latestTag = (() => {
	try {
		return capture('gh release list --limit 1 --json tagName --jq ".[0].tagName"')
	} catch {
		return null
	}
})()

console.log(`\n  Current version : ${currentVersion}`)
console.log(`  Latest release  : ${latestTag ?? '(none)'}`)

// ─── 3. choose bump type ──────────────────────────────────────────────────────

let bumpType = bumpArg

if (!bumpType) {
	const rl = createInterface({ input: process.stdin, output: process.stdout })

	console.log('\n● What kind of release is this?\n')
	for (const type of ['patch', 'minor', 'major']) {
		console.log(`  ${type.padEnd(7)} → ${bumpVersion(currentVersion, type)}`)
	}
	console.log()

	const answer = await rl.question('  bump type (patch/minor/major): ')
	rl.close()

	bumpType = answer.trim().toLowerCase()
	if (!['patch', 'minor', 'major'].includes(bumpType)) {
		abort(`Invalid bump type: ${bumpType}`)
	}
}

const newVersion = bumpVersion(currentVersion, bumpType)
console.log(`\n● Bumping ${currentVersion} → ${newVersion} (${bumpType})`)

// ─── 4. bump all version files ────────────────────────────────────────────────

console.log('\n● Updating version files…')

// package.json
pkg.version = newVersion
writeJson('package.json', pkg)

// package-lock.json
try {
	const lock = readJson('package-lock.json')
	lock.version = newVersion
	if (lock.packages?.['']) lock.packages[''].version = newVersion
	writeJson('package-lock.json', lock)
} catch {
	// no lockfile — fine
}

// manifest.json
const manifest = readJson('manifest.json')
manifest.version = newVersion
writeJson('manifest.json', manifest)

// versions.json
const versions = readJson('versions.json')
versions[newVersion] = manifest.minAppVersion
writeJson('versions.json', versions)

console.log('  ✓ package.json, package-lock.json, manifest.json, versions.json')

// ─── 5. build + test ──────────────────────────────────────────────────────────

console.log('\n● Building…')
run('npm run build')

console.log('\n● Running tests…')
run('npm test')

// ─── 6. commit ────────────────────────────────────────────────────────────────

console.log('\n● Committing version bump…')

const filesToCommit = ['package.json', 'package-lock.json', 'manifest.json', 'versions.json']
	.filter((f) => {
		try {
			return capture(`git status --porcelain ${f}`).length > 0
		} catch {
			return false
		}
	})

if (filesToCommit.length === 0) abort('No version files changed — something went wrong.')

run(`git add ${filesToCommit.join(' ')}`)
run(`git commit -m "chore: bump to ${newVersion}"`)
run('git push')

console.log(`  ✓ Committed and pushed`)

// ─── 7. changelog ─────────────────────────────────────────────────────────────

let changelog = ''
const fromRef = latestTag ?? capture('git rev-list --max-parents=0 HEAD')

const commits = capture(`git log ${fromRef}..HEAD~1 --oneline`)
if (commits) {
	const lines = commits
		.split('\n')
		.map((line) => {
			const [hash, ...rest] = line.split(' ')
			return `- ${rest.join(' ')} (${hash})`
		})
		.join('\n')
	changelog = `## Changes\n\n${lines}`
} else {
	changelog = `## Changes\n\n- ${newVersion}`
}

// ─── 8. github release ────────────────────────────────────────────────────────

console.log('\n● Creating GitHub release…')

const releaseAssets = ['main.js', 'manifest.json', 'styles.css'].filter((f) => {
	try {
		readFileSync(f)
		return true
	} catch {
		return false
	}
})

const notesFile = `/tmp/release-notes-${newVersion}.md`
writeFileSync(notesFile, changelog)

run(
	`gh release create ${newVersion} ${releaseAssets.join(' ')} --title "${newVersion}" --notes-file "${notesFile}"`,
)

console.log(`\n✓ Released ${newVersion} 🎉`)
