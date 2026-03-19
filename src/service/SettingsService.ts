import { Plugin } from 'obsidian'
import { CanvasServiceConfig } from '../service/CanvasServiceConfig'
import { DEFAULT_FILE_FILTER, DEFAULT_TRANSCRIPTS_FOLDER, DEFAULT_PROMPT, DEFAULT_TEMPLATE } from '../utils/constants'
import { AttachmentParserConfig } from './AttachmentParserService'

export type Settings = {
	runOnStart: boolean
	runOnStartMobile: boolean
	transcriptsFolder: string
	googleApiKey: string
	fileFilter: string
	prompt: string
	template: string
}

export type SettingsService = CanvasServiceConfig & {
	readonly runOnStart: boolean
	readonly runOnStartMobile: boolean
	readonly transcriptsFolder: string
	readonly googleApiKey: string
	readonly canvasPostfix: string
	readonly fileFilter: string
	readonly prompt: string
	readonly template: string
	getApiKey(): string

	updateRunOnStart(value: boolean): Promise<void>
	updateRunOnStartMobile(value: boolean): Promise<void>
	updateTranscriptsFolder(value: string): Promise<void>
	updateGoogleApiKey(value: string): Promise<void>
	updateFileFilter(value: string): Promise<void>
	updatePrompt(value: string): Promise<void>
	updateTemplate(value: string): Promise<void>
	restoreDefaults(): Promise<void>
}

export class SettingsServiceImpl implements SettingsService, AttachmentParserConfig {
	private settings: Settings
	private plugin: Plugin

	constructor(plugin: Plugin) {
		this.plugin = plugin
		this.settings = this.getDefaultSettings()
	}

	readonly canvasPostfix = '.canvas.md'

	get runOnStart(): boolean {
		return this.settings.runOnStart
	}

	get runOnStartMobile(): boolean {
		return this.settings.runOnStartMobile
	}

	get transcriptsFolder(): string {
		return this.settings.transcriptsFolder
	}

	get googleApiKey(): string {
		return this.settings.googleApiKey
	}

	get fileFilter(): string {
		return this.settings.fileFilter
	}

	get prompt(): string {
		return this.settings.prompt
	}

	get template(): string {
		return this.settings.template
	}

	getApiKey(): string {
		return this.settings.googleApiKey
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(this.getDefaultSettings(), await this.plugin.loadData())
	}

	async updateRunOnStart(value: boolean): Promise<void> {
		this.settings.runOnStart = value
		await this.saveSettings()
	}

	async updateRunOnStartMobile(value: boolean): Promise<void> {
		this.settings.runOnStartMobile = value
		await this.saveSettings()
	}

	async updateTranscriptsFolder(value: string): Promise<void> {
		this.settings.transcriptsFolder = value.length < 2 ? 'transcripts' : value
		await this.saveSettings()
	}

	async updateGoogleApiKey(value: string): Promise<void> {
		this.settings.googleApiKey = value
		await this.saveSettings()
	}

	async updateFileFilter(value: string): Promise<void> {
		this.settings.fileFilter = value
		await this.saveSettings()
	}

	async updatePrompt(value: string): Promise<void> {
		this.settings.prompt = value
		await this.saveSettings()
	}

	async updateTemplate(value: string): Promise<void> {
		this.settings.template = value
		await this.saveSettings()
	}

	async restoreDefaults(): Promise<void> {
		this.settings = this.getDefaultSettings()
		await this.saveSettings()
	}

	private getDefaultSettings(): Settings {
		return {
			runOnStart: true,
			runOnStartMobile: false, // Default to false for mobile for safety
			transcriptsFolder: DEFAULT_TRANSCRIPTS_FOLDER,
			googleApiKey: '',
			fileFilter: DEFAULT_FILE_FILTER,
			prompt: DEFAULT_PROMPT,
			template: DEFAULT_TEMPLATE,
		}
	}

	private async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings)
	}
}
