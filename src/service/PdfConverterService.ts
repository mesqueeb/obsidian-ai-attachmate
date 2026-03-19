import { File, FileDao } from '../dao/FileDao'
import { applyTemplate } from '../utils/applyTemplate'
import { DEFAULT_TEMPLATE } from '../utils/constants'
import { AttachmentParserService } from './AttachmentParserService'
import { BaseConverterService } from './BaseConverterService'

export class PdfConverterService extends BaseConverterService {
	constructor(
		fileDao: FileDao,
		transcriptsFolder: string,
		private parser: AttachmentParserService,
		fileFilter?: string,
		private getTemplate: () => string = () => DEFAULT_TEMPLATE,
	) {
		super(fileDao, {
			transcriptsFolder,
			sourceExtension: '.pdf',
			targetExtension: '.pdf.md',
			fileFilter,
		})
	}

	protected async convertContent(source: File): Promise<string> {
		const transcript = await this.parser.parseAttachmentContent(
			source.sizeInMB,
			() => source.getBinaryContent(),
			source.path,
		)
		return applyTemplate(this.getTemplate(), { filename: source.name, path: source.path }, transcript)
	}

	override async convertFiles(): Promise<void> {
		if (!this.parser.validateApiKey()) {
			console.warn('No Google API key configured - PDF parsing will be skipped')
			return
		}
		await super.convertFiles()
	}
}
