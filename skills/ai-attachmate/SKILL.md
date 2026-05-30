---
name: ai-attachmate
description: Transcribe PDFs, images, and Canvas files in an Obsidian vault to Markdown using the active agent's vision/PDF tools instead of Gemini. Mirrors AI Attachmate plugin behavior: file filters, prompts, templates, transcript paths, user-zone preservation, and orphan handling. Works in Claude Code, Codex, or another local-file runner. Use when the user wants to bulk-transcribe attachments in an Obsidian vault, mentions "ai-attachmate", "transcribe attachments", "process my vault attachments", or runs this skill from inside an Obsidian vault folder.
---

# AI Attachmate

Bulk-transcribe an Obsidian vault's attachments (PDFs, images, Canvas files) into Markdown notes using the current agent's LLM and file-inspection tools.

## Prerequisites

- `tsx` installed globally: `npm install -g tsx`
- An Obsidian vault. If the AI Attachmate plugin has settings at `<vault>/.obsidian/plugins/ai-attachmate/data.json`, reuse them; otherwise the scripts use plugin defaults.

## Workflow

### 1. Locate the vault

Walk up from the current working directory looking for a `.obsidian/` folder. If none is found within a few levels, ask the user for the vault path. The vault root is the directory that contains `.obsidian/`.

### 2. Plan the run

Run the planner:

```sh
tsx <skill-dir>/scripts/plan.ts <vault-root>
```

It emits JSON to stdout:

```json
{
  "vault": "/abs/path/to/vault",
  "prompt": "<user's configured prompt>",
  "template": "<user's configured template>",
  "newFiles":  [{ "source": "...", "target": "..." }],
  "staleFiles":[{ "source": "...", "target": "...", "userZone": "..." }],
  "orphans":   ["..."],
  "upToDate":  42
}
```

- `newFiles` — no transcript exists yet
- `staleFiles` — transcript exists but `source.mtime >= transcript.mtime`; `userZone` is the text above the `<!--auto-generate-content-below-->` marker, to be preserved
- `orphans` — transcript exists but the source attachment is gone
- `upToDate` — count of files whose transcripts are current (no action)

If `newFiles` + `staleFiles` is empty and there are no orphans, report "nothing to do" and stop.

### 3. Transcribe

Process each file in `newFiles` and `staleFiles`. If the runner supports sub-agents or parallel tasks, fan out in small batches of ~5-10 files. If not, process them serially in the main agent.

**For `.canvas` files** — no AI needed, sub-agent (or main agent) just runs:

```sh
tsx <skill-dir>/scripts/transcribe-canvas.ts "<vault>/<source>" | \
  tsx <skill-dir>/scripts/write-transcript.ts \
    --vault "<vault>" --source "<source>" --target "<target>" --user-zone "<zone>"
```

**For `.pdf` / `.png` / `.jpg` / `.jpeg`** — each worker is instructed to:

1. Inspect the file at `<vault>/<source>` using the runner's available local file, image, or PDF tools.
   - In Claude Code, this may be native PDF/image reading.
   - In Codex, use available image/PDF inspection tools. For images, inspect the local image path directly when possible; for PDFs, convert pages to image files first if needed.
   - If the runner cannot inspect the attachment, report the file as an error instead of inventing a transcript.
2. Apply the user's configured `prompt` from the plan output verbatim as its instruction for that file. The prompt's output is the transcript body.
3. Pipe the body to `write-transcript.ts`. Avoid `echo` for generated bodies because transcripts may contain quotes, backslashes, or multiple lines:

```sh
cat <<'TRANSCRIPT_BODY' | tsx <skill-dir>/scripts/write-transcript.ts \
  --vault "<vault>" --source "<source>" --target "<target>" --user-zone "<zone>"
<body>
TRANSCRIPT_BODY
```

`write-transcript.ts` handles applying the user's `template` and re-attaching the preserved `userZone` above the auto-generated marker.

Each worker should return only a short status (success / error message), never the file contents. Keep the main agent's context clean.

### 4. Handle orphans

If `orphans` is non-empty, show the list to the user and ask whether to delete them. Only delete on explicit confirmation. The plugin auto-deletes; the skill does not, because skill runs are interactive.

### 5. Report summary

Print: `N transcribed, M skipped (up-to-date), K orphans <deleted|kept>, E errors`.

## Notes

- All paths in plan output are vault-relative; prepend `<vault>/` when reading or writing.
- `scripts/_synced/` is auto-generated from the plugin's `src/utils/` via `scripts/sync-skill-and-plugin.mjs` in the source repo. Do not edit those files in place.
- Large vaults: if the plan returns hundreds of files, suggest the user narrow the `fileFilter` setting first, or process in chunks.
