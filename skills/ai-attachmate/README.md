# ai-attachmate (Claude Code skill)

A Claude Code skill that transcribes attachments (PDFs, images, Canvas files) in an Obsidian vault to Markdown — same behavior as the [AI Attachmate Obsidian plugin](https://github.com/mesqueeb/obsidian-ai-attachmate), but using Claude as the AI provider instead of Gemini.

The skill reuses the plugin's settings (file filter, prompt, template, transcripts folder), so it produces output indistinguishable from the plugin's.

## Install

1. Install `tsx` globally:

   ```sh
   npm install -g tsx
   ```

2. Copy this folder into your Claude Code skills directory:

   ```sh
   cp -r skills/ai-attachmate ~/.claude/skills/
   ```

3. (Optional) `cd` into an Obsidian vault, then ask Claude Code to transcribe your attachments — the skill auto-activates.

## How it works

1. Walks up from the current directory to find an Obsidian vault (`.obsidian/`)
2. Reads the AI Attachmate plugin's settings from `<vault>/.obsidian/plugins/ai-attachmate/data.json`
3. Runs `plan.ts` to classify every attachment as new / stale / orphan / up-to-date
4. Fans out sub-agents in parallel batches to transcribe new and stale files (Claude reads PDFs and images natively)
5. Preserves any notes you've written above the `<!--auto-generate-content-below-->` marker
6. Asks before deleting orphaned transcripts (unlike the plugin, which auto-deletes)

## Maintenance

The `scripts/_synced/` folder is auto-generated from the plugin's `src/utils/` by a sync script in the parent repo. Don't edit those files in place.
