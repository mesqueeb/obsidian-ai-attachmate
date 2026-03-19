import {App, Platform, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {SettingsService} from "../service/SettingsService";

export class SettingsTab extends PluginSettingTab {
	private settingsService: SettingsService;

	constructor(app: App, plugin: Plugin, settingsService: SettingsService) {
		super(app, plugin);
		this.settingsService = settingsService;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		const descriptionEl = containerEl.createEl('div', { cls: 'plugin-description' });
		descriptionEl.createEl('p', { text: 'AI Attachmate watches your vault and transcribes PDFs, images, and Canvas files into Markdown — automatically. Each transcript includes a section at the top where you can add your own notes, and those notes are preserved even when the file is re-transcribed.' });

		new Setting(containerEl)
			.setName('Run on start')
			.setDesc('Automatically transcribe new or changed files when Obsidian loads.')
			.addToggle(toggle => toggle
				.setValue(this.settingsService.runOnStart)
				.onChange(async (value) => {
					await this.settingsService.updateRunOnStart(value);
				}));

		new Setting(containerEl)
			.setName('Run on start (Mobile)')
			.setDesc('Same as above, but for mobile. Disabled by default — enable only after the initial transcription is done, as large vaults can take a while and may cause Obsidian to restart on mobile.')
			.addToggle(toggle => toggle
				.setValue(this.settingsService.runOnStartMobile)
				.onChange(async (value) => {
					await this.settingsService.updateRunOnStartMobile(value);
				}));

		new Setting(containerEl)
			.setName('File filter')
			.setDesc(createFragment(el => {
				el.appendText('Glob pattern to control which files get transcribed. Default: ');
				el.createEl('code', {text: '**/*.{canvas,pdf,png,jpg,jpeg}'});
				el.appendText(' (everything). Use ');
				el.createEl('code', {text: '**/attachments/*.{canvas,pdf,png,jpg,jpeg}'});
				el.appendText(' to only transcribe files directly inside any ');
				el.createEl('code', {text: 'attachments/'});
				el.appendText(' folder.');
			}))
			.addText(text => text
				.setPlaceholder('**/*.{canvas,pdf,png,jpg,jpeg}')
				.setValue(this.settingsService.fileFilter)
				.onChange(async (value) => {
					await this.settingsService.updateFileFilter(value);
				}));

		new Setting(containerEl)
			.setName('Index folder')
			.setDesc(createFragment(el => {
				el.appendText('Where to save transcripts. Use ');
				el.createEl('code', {text: './'});
				el.appendText(' to place each transcript next to its source file (default), or a folder name like ');
				el.createEl('code', {text: 'index'});
				el.appendText(' to collect them all in one place. If you change this setting, delete the old folder and re-run the transcription.');
			}))
			.addText(text => text
				.setPlaceholder('./')
				.setValue(this.settingsService.indexFolder)
				.onChange(async (value) => {
					await this.settingsService.updateIndexFolder(value);
				}));

		new Setting(containerEl)
			.setName('Google API Key')
			.setDesc(createFragment(el => {
				el.appendText('Required for PDFs and images. Canvas files work without a key. Gemini\'s free tier is generous enough for most vaults. Get your key at ');
				el.createEl('a', {
					href: 'https://aistudio.google.com/app/apikey',
					text: 'aistudio.google.com',
					cls: 'external-link'
				});
				el.appendText('.');
			}))
			.addText(text => {
				text.inputEl.type = 'password';
				text.setPlaceholder('Enter your Google API key')
					.setValue(this.settingsService.googleApiKey)
					.onChange(async (value) => {
						await this.settingsService.updateGoogleApiKey(value);
					});
			});

		// Add Restore Defaults button
		new Setting(containerEl)
			.setName('Restore defaults')
			.setDesc('Reset all settings to their default values.')
			.addButton(button => button
				.setButtonText('Restore defaults')
				.onClick(async () => {
					await this.settingsService.restoreDefaults();
					this.display(); // Refresh the settings UI
				}));
	}
}
