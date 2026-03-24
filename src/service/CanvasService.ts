import { File, FileDao } from '../dao/FileDao'
import { applyTemplate } from '../utils/applyTemplate'
import { convertCanvasToMd } from '../utils/canvasToMd'
import { DEFAULT_TEMPLATE } from '../utils/constants'
import { BaseConverterService } from './BaseConverterService'
import { CanvasServiceConfig } from './CanvasServiceConfig'

export class CanvasService extends BaseConverterService {
	private getTemplate: () => string

	constructor(
		fileDao: FileDao,
		config: CanvasServiceConfig,
		getTemplate: () => string = () => DEFAULT_TEMPLATE,
	) {
		super(fileDao, {
			transcriptsFolder: config.transcriptsFolder,
			sourceExtension: '.canvas',
			targetExtension: config.canvasPostfix,
			fileFilter: config.fileFilter,
		})
		this.getTemplate = getTemplate
	}

	protected async convertContent(source: File, targetPath: string): Promise<string> {
		const rawContent = await source.getContent()
		const transcript = convertCanvasToMd(rawContent)
		return applyTemplate(
			this.getTemplate(),
			{ filename: source.name, path: source.path, targetPath },
			transcript,
			{ canvas: true },
		)
	}
}
