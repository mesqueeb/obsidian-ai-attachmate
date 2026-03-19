# AI Attachmate

**AI Attachmate** transcribes your PDFs, images, and Canvas files into searchable Markdown notes using AI. You control which files get transcribed, with what prompt, and where the transcription is saved — bring your own key.

Once set up, it just works in the background: attach a file, get a Markdown transcript. No fuss.

## A workflow that works great

Here's a setup that feels really natural:

- Set the **file filter** to something like `attachments/**` to limit transcription to files nested under your `/attachments/` folder
- Set the **index folder** to `./` (relative, same folder as the original file)

With this setup, any PDF you drop into an Obsidian note gets a full transcript right alongside it — automatically. The transcript includes a section at the top where you can write your own notes, and those notes are preserved even if the original file changes and the transcript is regenerated.

![Plugin settings](./screenshots/settings.png)

![Generated transcript](./screenshots/transcript.png)

![Status view](./screenshots/status-view.png)

## Features

- **Automatic transcription** — PDFs, images (`.png`, `.jpg`, `.jpeg`), and Canvas files (`.canvas`) are converted to Markdown as soon as they appear in your vault
- **Your notes are safe** — each transcript has a section at the top for your own notes; they're preserved across re-transcriptions
- **Custom AI prompt** — configure the prompt used for each file type so the output fits your workflow
- **Custom template** — control how the generated Markdown file is structured
- **File filter** — use glob patterns to include only specific files or folders
- **Flexible output location** — set an absolute folder or a relative path (e.g. `./` puts the transcript right next to the original)
- **Status view** — see which files are currently being processed via the sidebar panel
- **Orphan cleanup** — when you delete an attachment, its transcript is removed too
- **Canvas support without an API key** — Canvas files are converted locally, no AI needed

## File filter

By default, all supported files in your vault are transcribed (`**/*.{canvas,pdf,png,jpg,jpeg}`). You can narrow this down using a glob pattern in the **File Filter** setting.

The `**` wildcard matches any number of nested folders, while `*` matches within a single folder only. This distinction matters a lot:

| Pattern | Matches | Doesn't match |
|---------|---------|---------------|
| `**/*.{canvas,pdf,png,jpg,jpeg}` | All supported files, anywhere in the vault (default) | — |
| `**/attachments/*.{canvas,pdf,png,jpg,jpeg}` | Files directly inside any `attachments/` folder, at any depth | Files in subfolders of `attachments/` |
| `attachments/*.{canvas,pdf,png,jpg,jpeg}` | Files directly inside the top-level `attachments/` folder only | `notes/attachments/file.pdf` |
| `**/attachments/**/*.{canvas,pdf,png,jpg,jpeg}` | Files anywhere inside any `attachments/` folder, at any depth | — |
| `**/*.pdf` | Only PDFs, anywhere in the vault | Canvas, images |

**Recommended setup:** configure Obsidian's attachment folder to `attachments/` (Settings → Files & Links → Default location for new attachments → "In the folder specified below"), then set the file filter to `**/attachments/*.{canvas,pdf,png,jpg,jpeg}`. Every file you attach to any note gets transcribed automatically.

## Index folder (where transcripts are saved)

By default, transcripts are placed **in the same folder as the source file** (`./`). You can also collect them all in one place using an absolute path.

| Setting | Effect |
|---------|--------|
| `./` | Transcript is placed in the same folder as the source file (default) |
| `index` | All transcripts go into `/index/` at the vault root |
| `../transcripts` | Transcript goes into a `transcripts/` folder one level up from the source file |

Relative paths starting with `./` or `../` are resolved per file. If a `../` path would go above the vault root, it clamps to the root instead of erroring.

## Setup

1. Install the plugin
2. Go to **Settings → AI Attachmate**
3. Add your [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier works fine)
4. Optionally configure the file filter, index folder, prompt, and template
5. Run the transcription manually or let it run automatically on startup

> Currently supports Google Gemini as the AI provider. Feel free to open an issue if you'd like support for another model provider.

## Supported file types

| File type | Requires API key |
|-----------|-----------------|
| Canvas (`.canvas`) | No |
| PDF (`.pdf`) | Yes |
| Image (`.png`, `.jpg`, `.jpeg`) | Yes |

## License

This project is available under the [GNU Affero General Public License v3.0](./LICENSE) (AGPL-3.0).

<sub>Built on original work of https://github.com/iinkov/obsidian-attachments-md-indexer and taken into a new direction to add more features and user agency.</sub>
