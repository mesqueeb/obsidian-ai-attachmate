# AI Attachmate

**AI Attachmate** transcribes your PDFs, images, and Canvas files into searchable Markdown notes using AI. You control which files get transcribed, with what prompt, and where the transcription is saved — bring your own key.

Once set up, it runs in the background: attach a file, get a Markdown transcript.

## Features

- **Automatic transcription** — PDFs, images (`.png`, `.jpg`, `.jpeg`), and Canvas files (`.canvas`) are transcribed to Markdown as soon as they appear in your vault
- **Your notes are safe** — each transcript has a user zone at the top for your own notes; they're preserved across re-transcriptions
- **Custom AI prompt** — configure the Gemini prompt used for each attachment so the output fits your workflow
- **Output template** — control how every generated transcript is structured
- **File filter** — use glob patterns to include only specific attachments or folders
- **Flexible transcripts folder** — set an absolute folder or a relative path (e.g. `./` puts the transcript right next to the attachment)
- **Status view** — see which attachments are currently being transcribed via the sidebar panel
- **Orphan cleanup** — when you delete an attachment, its transcript is removed too
- **Canvas support without an API key** — Canvas files are transcribed locally, no AI needed

## Google Gemini API key

PDFs and images are processed by Google Gemini. [Get your API key here](https://aistudio.google.com/app/apikey) — the free tier works fine. Canvas files work without a key.

The free tier has a daily request cap, so a large vault may take several hours or a couple of days to fully process on first run. That's normal — the plugin picks up where it left off each time it runs.

Only Google Gemini is supported as the AI provider for now. Feel free to open an issue if you'd like support for another.

## File filter

By default, all supported files in your vault are transcribed (`**/*.{canvas,pdf,png,jpg,jpeg}`). You can narrow this down using a glob pattern in the **File Filter** setting.

The `**` wildcard matches any number of nested folders, while `*` matches within a single folder only.

| Pattern                                         | Effect                                                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `**/*.{canvas,pdf,png,jpg,jpeg}`                | All supported files, anywhere in the vault (default)                                                             |
| `**/*.pdf`                                      | Only PDFs, anywhere in the vault                                                                                 |
| `**/attachments/**/*.{canvas,pdf,png,jpg,jpeg}` | Files anywhere inside any `attachments/` folder, at any depth                                                    |
| `**/attachments/*.{canvas,pdf,png,jpg,jpeg}`    | Files directly inside any `attachments/` folder, at any depth<br>(not files nested deeper inside `attachments/`) |
| `attachments/*.{canvas,pdf,png,jpg,jpeg}`       | Files directly inside the top-level `attachments/` folder only<br>(not `notes/attachments/file.pdf`)             |

**Recommended setup:** configure Obsidian's attachment folder to `attachments/` (Settings → Files & Links → Default location for new attachments → "In the folder specified below"), then set the file filter to `**/attachments/*.{canvas,pdf,png,jpg,jpeg}`. Every file you attach to any note gets transcribed automatically.

## Transcripts folder (where transcripts are saved)

By default, transcripts are placed in the same folder as the source file (`./`). You can also use a relative path to go up a level, or an absolute folder name to collect everything in one place.

| Setting          | Effect                                                         |
| ---------------- | -------------------------------------------------------------- |
| `./`             | Transcript placed next to the source file (default)            |
| `../`            | Transcript placed in the parent folder of the source file      |
| `../transcripts` | Transcript placed in a `transcripts/` folder one level up      |
| `transcripts`    | All transcripts collected in `/transcripts/` at the vault root |

Relative paths (`./`, `../`) are resolved per file. If a `../` path would go above the vault root, it clamps to the root instead of erroring.

## Supported file types

| File type                       | Requires API key |
| ------------------------------- | ---------------- |
| Canvas (`.canvas`)              | No               |
| PDF (`.pdf`)                    | Yes              |
| Image (`.png`, `.jpg`, `.jpeg`) | Yes              |

## Build from source

```sh
git clone https://github.com/mesqueeb/obsidian-ai-attachmate
cd obsidian-ai-attachmate
npm install
npm run build-and-install -- /path/to/your/obsidian/vault
```

Then reload the plugin in Obsidian (Settings → Community plugins → AI Attachmate → toggle off and on).

## Support development

If you love using AI Attachmate, please consider supporting its continued development.

[![💜 Sponsor](https://img.shields.io/badge/💜_Sponsor-GitHub-informational?style=flat)](https://github.com/sponsors/mesqueeb) [![☕ Buy me a coffee](https://img.shields.io/badge/☕_Buy_me_a_coffee-buymeacoffee.com-yellow?style=flat)](https://buymeacoffee.com/mesqueeb)

## License

This project is available under the [GNU Affero General Public License v3.0](./LICENSE) (AGPL-3.0).

<sub>Built on original work of https://github.com/iinkov/obsidian-attachments-md-indexer and taken into a new direction to add more features and user agency.</sub>
