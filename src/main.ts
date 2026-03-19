import { Notice, Platform, Plugin } from 'obsidian'
import { FileAdapter } from './dao/FileAdapter'
import { FileDaoImpl } from './dao/FileDaoImpl'
import { ObsidianFileAdapter } from './dao/ObsidianFileAdapter'
import {
	FatalProcessingError,
	GeminiAttachmentParserService,
} from './service/AttachmentParserService'
import { CanvasService } from './service/CanvasService'
import { ConversionStatusTracker } from './service/ConversionStatusTracker'
import { JpegConverterService } from './service/JpegConverterService'
import { JpgConverterService } from './service/JpgConverterService'
import { PdfConverterService } from './service/PdfConverterService'
import { PngConverterService } from './service/PngConverterService'
import { SettingsServiceImpl } from './service/SettingsService'
import { SettingsTab } from './utils/SettingsTab'
import { STATUS_VIEW_TYPE, StatusView } from './utils/StatusView'

export default class ObsidianAiAttachmate extends Plugin {
	private isConverting = false

	override async onload(): Promise<void> {
		// Initialize settings manager and load settings
		const settingsService = new SettingsServiceImpl(this)
		await settingsService.loadSettings()

		// Initialize status tracker
		const statusTracker = new ConversionStatusTracker()

		// Register status view
		this.registerView(STATUS_VIEW_TYPE, (leaf) => new StatusView(leaf, statusTracker))

		// Add ribbon button to open status view
		this.addRibbonIcon('list-checks', 'AI Attachmate Status', async () => {
			const existing = this.app.workspace.getLeavesOfType(STATUS_VIEW_TYPE)
			if (existing.length > 0) {
				this.app.workspace.revealLeaf(existing[0])
			} else {
				const leaf = this.app.workspace.getLeaf('tab')
				await leaf.setViewState({ type: STATUS_VIEW_TYPE, active: true })
				this.app.workspace.revealLeaf(leaf)
			}
		})

		// Initialize dependencies
		const fileAdapter: FileAdapter = new ObsidianFileAdapter(this.app)
		const fileDao = new FileDaoImpl(fileAdapter)
		const getTemplate = (): string => settingsService.template
		const canvasService = new CanvasService(fileDao, settingsService, getTemplate)

		// Create parser instances with specific prompts for each type
		const getPrompt = (): string => settingsService.prompt

		const pdfParser = new GeminiAttachmentParserService(
			settingsService,
			'application/pdf',
			getPrompt,
		)
		const pngParser = new GeminiAttachmentParserService(settingsService, 'image/png', getPrompt)
		const jpgParser = new GeminiAttachmentParserService(settingsService, 'image/jpeg', getPrompt)
		const jpegParser = new GeminiAttachmentParserService(settingsService, 'image/jpeg', getPrompt)

		// Create converters
		const pdfConverter = new PdfConverterService(
			fileDao,
			settingsService.transcriptsFolder,
			pdfParser,
			settingsService.fileFilter,
			getTemplate,
		)
		const pngConverter = new PngConverterService(
			fileDao,
			settingsService.transcriptsFolder,
			pngParser,
			settingsService.fileFilter,
			getTemplate,
		)
		const jpgConverter = new JpgConverterService(
			fileDao,
			settingsService.transcriptsFolder,
			jpgParser,
			settingsService.fileFilter,
			getTemplate,
		)
		const jpegConverter = new JpegConverterService(
			fileDao,
			settingsService.transcriptsFolder,
			jpegParser,
			settingsService.fileFilter,
			getTemplate,
		)

		// Wire status tracker into all converters
		canvasService.setStatusTracker(statusTracker)
		pdfConverter.setStatusTracker(statusTracker)
		pngConverter.setStatusTracker(statusTracker)
		jpgConverter.setStatusTracker(statusTracker)
		jpegConverter.setStatusTracker(statusTracker)

		// Initialize converters and other services
		const runConversion = async (): Promise<void> => {
			if (this.isConverting) {
				new Notice('Conversion is already in progress. Please wait.')
				return
			}

			this.isConverting = true
			try {
				// Run converters sequentially
				await canvasService.convertFiles()
				await pdfConverter.convertFiles()
				await pngConverter.convertFiles()
				await jpgConverter.convertFiles()
				await jpegConverter.convertFiles()

				// Show success notification
				new Notice('All attachments transcribed successfully')
			} catch (error) {
				if (error instanceof FatalProcessingError) {
					// Show error notification
					new Notice(
						error.message.includes('No Google API key')
							? error.message
							: 'Transcription stopped due to Gemini API errors. Please try again later.',
					)
					console.error('Transcription stopped:', error.message)
				} else {
					// Handle other errors
					new Notice('An error occurred during transcription')
					console.error('Conversion error:', error)
				}
			} finally {
				this.isConverting = false
			}
		}

		// Add settings tab
		this.addSettingTab(new SettingsTab(this.app, this, settingsService))

		// Add command for manual conversion
		this.addCommand({
			id: 'convert-canvas-files',
			name: 'Transcribe attachments to Markdown',
			callback: async () => {
				await runConversion()
			},
		})

		// Schedule a delayed conversion if runOnStart is enabled
		const shouldAutoStart = Platform.isMobile
			? settingsService.runOnStartMobile
			: settingsService.runOnStart

		if (shouldAutoStart) {
			this.app.workspace.onLayoutReady(() => {
				runConversion()
			})
		}
	}
}
