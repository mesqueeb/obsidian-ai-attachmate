---
name: release
description: Analyze unreleased commits, pick a semver bump type, and publish a GitHub release. Use when the user wants to release, publish, bump the version, or run a release.
---

# Release

Analyze the unreleased changes and run the release script with the appropriate bump type.

## Steps

1. **Get the latest release tag:**
   ```bash
   gh release list --limit 1 --json tagName --jq '.[0].tagName'
   ```

2. **Review the commits since that tag:**
   ```bash
   git log <tag>..HEAD --oneline
   ```

3. **Decide the bump type** based on the commits:
   - `major` — breaking changes, or the word "breaking" appears in commits
   - `minor` — new user-facing features (feat:, add, new)
   - `patch` — bug fixes, chores, docs, refactors, tests only

4. **Run the release script** with your chosen bump:
   ```bash
   node scripts/release.mjs --bump <patch|minor|major>
   ```

Explain your bump-type reasoning briefly before running the script.

> The commit message is `chore: bump to <version>` — no co-author or AI metadata.
