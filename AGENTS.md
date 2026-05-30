# Agent notes for obsidian-ai-attachmate

This repo is an Obsidian plugin that transcribes attachments (PDFs, images, Canvas files) to Markdown using Google Gemini.

## Companion Claude Code skill

`skills/ai-attachmate/` contains the source for a standalone Claude Code skill that mirrors the plugin's behavior but routes vision/PDF reading through Claude instead of Gemini. Users copy that folder into `~/.claude/skills/` to install it.

The skill's helper scripts (in `skills/ai-attachmate/scripts/_synced/`) are auto-generated from `src/utils/` by `scripts/sync-skill-and-plugin.mjs`. Do not edit `_synced/` files by hand — edit the originals in `src/utils/` and run `npm run sync-skill`. `npm run build` runs the sync automatically.

## Common commands

- `npm run build` — type-check, sync skill, and build the plugin
- `npm run test` — vitest (covers both plugin and skill scripts)
- `npm run sync-skill` — re-sync `skills/ai-attachmate/scripts/_synced/`
- `node scripts/sync-skill-and-plugin.mjs --check` — fail if synced copies are stale
