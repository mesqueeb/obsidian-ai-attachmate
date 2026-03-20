import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { SettingsService } from '../service/SettingsService'

export class SettingsTab extends PluginSettingTab {
	private settingsService: SettingsService

	constructor(app: App, plugin: Plugin, settingsService: SettingsService) {
		super(app, plugin)
		this.settingsService = settingsService
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		const descriptionEl = containerEl.createEl('div', { cls: 'plugin-description' })
		descriptionEl.createEl('p', {
			text: 'AI Attachmate watches your vault and transcribes PDFs, images, and Canvas files into Markdown — automatically. Each transcript includes a section at the top where you can add your own notes, and those notes are preserved even when the file is re-transcribed.',
		})

		// Support development
		new Setting(containerEl)
			.setName('Support development')
			.setDesc(
				'If you love using AI Attachmate, please consider supporting its continued development.',
			)
			.addButton((button) =>
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				button.setButtonText('💜 Sponsor').onClick(() => {
					window.open('https://github.com/sponsors/mesqueeb', '_blank')
				}),
			)
			.addButton((button) =>
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				button.setButtonText('☕ Buy me a coffee').onClick(() => {
					window.open('https://buymeacoffee.com/mesqueeb', '_blank')
				}),
			)

		new Setting(containerEl)
			.setName('File filter')
			.setDesc(
				createFragment((el) => {
					el.appendText('Glob pattern to control which files get transcribed. Default: ')
					el.createEl('code', { text: '**/*.{canvas,pdf,png,jpg,jpeg}' })
					el.appendText(' (everything). Use ')
					el.createEl('code', { text: '**/attachments/*.{canvas,pdf,png,jpg,jpeg}' })
					el.appendText(' to only transcribe files directly inside any ')
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					el.createEl('code', { text: 'attachments/' })
					el.appendText(' folder.')
				}),
			)
			.addText((text) =>
				text
					.setPlaceholder('**/*.{canvas,pdf,png,jpg,jpeg}')
					.setValue(this.settingsService.fileFilter)
					.onChange(async (value) => {
						await this.settingsService.updateFileFilter(value)
					}),
			)

		new Setting(containerEl)
			.setName('Transcripts folder')
			.setDesc(
				createFragment((el) => {
					el.appendText('Where to save transcripts. Use ')
					el.createEl('code', { text: './' })
					el.appendText(
						' to place each transcript next to its source file (default), or a folder name like ',
					)
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					el.createEl('code', { text: 'transcripts' })
					el.appendText(
						' to collect them all in one place. If you change this setting, delete the old folder and re-transcribe.',
					)
				}),
			)
			.addText((text) =>
				text
					.setPlaceholder('./')
					.setValue(this.settingsService.transcriptsFolder)
					.onChange(async (value) => {
						await this.settingsService.updateTranscriptsFolder(value)
					}),
			)

		new Setting(containerEl)
			.setName('Output template')
			.setDesc(
				createFragment((el) => {
					el.appendText('The header of every generated transcript. Use ')
					el.createEl('code', { text: '{{filename}}' })
					el.appendText(' and ')
					el.createEl('code', { text: '{{path}}' })
					el.appendText(
						' as placeholders. The marker and transcript section are always appended automatically.',
					)
				}),
			)
			.addTextArea((text) => {
				text.inputEl.rows = 10
				text.setValue(this.settingsService.template).onChange(async (value) => {
					await this.settingsService.updateTemplate(value)
				})
			})

		new Setting(containerEl)
			.setName('Google API key')
			.setDesc(
				createFragment((el) => {
					el.appendText(
						"Required for PDFs and images. Canvas files work without a key. The free tier has a daily request cap, so a large vault may take several hours or a couple of days to fully transcribe on first run — that's normal. ",
					)
					el.createEl('a', {
						href: 'https://aistudio.google.com/app/apikey',
						text: 'Get your API key here',
						cls: 'external-link',
					})
					el.appendText('.')
				}),
			)
			.addText((text) => {
				text.inputEl.type = 'password'
				text
					.setPlaceholder('Enter your Google API key')
					.setValue(this.settingsService.googleApiKey)
					.onChange(async (value) => {
						await this.settingsService.updateGoogleApiKey(value)
					})
			})

		new Setting(containerEl)
			.setName('Gemini prompt')
			.setDesc(
				'The instruction sent to Gemini for all PDF and image attachments. Changing this takes effect on the next transcription run.',
			)
			.addTextArea((text) => {
				text.inputEl.rows = 8
				text.setValue(this.settingsService.prompt).onChange(async (value) => {
					await this.settingsService.updatePrompt(value)
				})
			})

		new Setting(containerEl)
			.setName('Run on start')
			.setDesc('Automatically transcribe new or changed files when Obsidian loads.')
			.addToggle((toggle) =>
				toggle.setValue(this.settingsService.runOnStart).onChange(async (value) => {
					await this.settingsService.updateRunOnStart(value)
				}),
			)

		new Setting(containerEl)
			.setName('Run on start (mobile)')
			.setDesc(
				'Same as above, but for mobile. Disabled by default — enable only after the initial transcription is done, as large vaults can take a while and may cause Obsidian to restart on mobile.',
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settingsService.runOnStartMobile).onChange(async (value) => {
					await this.settingsService.updateRunOnStartMobile(value)
				}),
			)

		// Add Restore Defaults button
		new Setting(containerEl)
			.setName('Restore defaults')
			.setDesc('Reset all settings to their default values.')
			.addButton((button) =>
				button.setButtonText('Restore defaults').onClick(async () => {
					await this.settingsService.restoreDefaults()
					this.display() // Refresh the settings UI
				}),
			)
	}
}
