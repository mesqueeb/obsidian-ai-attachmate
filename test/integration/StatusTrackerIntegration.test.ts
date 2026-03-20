import { beforeEach, describe, expect, it } from 'vitest'
import { FileDaoImpl } from '../../src/dao/FileDaoImpl'
import { AttachmentParserService } from '../../src/service/AttachmentParserService'
import { CanvasService } from '../../src/service/CanvasService'
import { ConversionStatusTracker } from '../../src/service/ConversionStatusTracker'
import { PngConverterService } from '../../src/service/PngConverterService'
import { InMemoryFileAdapter } from '../dao/InMemoryFileAdapter'
import { createTestCanvasFile, createTestImageFile } from '../utils/testFileUtils'

describe('Integration: ConversionStatusTracker wired into converters', () => {
	let fileAdapter: InMemoryFileAdapter
	let fileDao: FileDaoImpl
	let tracker: ConversionStatusTracker

	beforeEach(() => {
		fileAdapter = new InMemoryFileAdapter()
		fileDao = new FileDaoImpl(fileAdapter)
		tracker = new ConversionStatusTracker()
	})

	it('all source files are pending when run starts', async () => {
		const canvasService = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			transcriptsFolder: 'transcripts',
		})
		canvasService.setStatusTracker(tracker)
		await createTestCanvasFile(fileDao, 'Test.canvas')
		await createTestCanvasFile(fileDao, 'Test-empty1.canvas')

		let pendingSnapshot: string[] = []
		tracker.onChange(() => {
			const all = tracker.getAll()
			if (all.every((f) => f.status === 'pending') && all.length === 2) {
				pendingSnapshot = all.map((f) => f.path)
			}
		})

		await canvasService.convertFiles()

		expect(pendingSnapshot).toContain('Test.canvas')
		expect(pendingSnapshot).toContain('Test-empty1.canvas')
	})

	it('file that errors during conversion ends as error with message', async () => {
		const throwingParser: AttachmentParserService = {
			validateApiKey: () => true,
			parseAttachmentContent: async () => {
				throw new Error('Gemini rate limit')
			},
		}
		const pngConverter = new PngConverterService(fileDao, 'transcripts', throwingParser)
		pngConverter.setStatusTracker(tracker)
		await createTestImageFile(fileAdapter, 'test-image.png')

		await pngConverter.convertFiles()

		const file = tracker.getAll().find((f) => f.path === 'test-image.png')
		expect(file?.status).toBe('error')
		expect(file?.errorMessage).toContain('Gemini rate limit')
	})

	it('skipped (up-to-date) file ends as done in tracker', async () => {
		const canvasService = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			transcriptsFolder: 'transcripts',
		})
		canvasService.setStatusTracker(tracker)
		await createTestCanvasFile(fileDao, 'Test.canvas')

		// First run creates the transcript
		await new Promise((resolve) => setTimeout(resolve, 3))
		await canvasService.convertFiles()

		// Second run — source is older than transcript, file is skipped
		await new Promise((resolve) => setTimeout(resolve, 3))
		await canvasService.convertFiles()

		const file = tracker.getAll().find((f) => f.path === 'Test.canvas')
		expect(file?.status).toBe('done')
	})

	it('new files without a transcript never show done before processing', async () => {
		// Regression: modifyConvertedFiles used to set files to 'done' immediately when no
		// transcript existed, then createConvertedFiles would flip them back to 'processing'.
		// With multiple files this caused a visible done → processing jump in the status view.
		const mockParser: AttachmentParserService = {
			validateApiKey: () => true,
			parseAttachmentContent: async () => '# Transcript',
		}
		const pngConverter = new PngConverterService(fileDao, 'transcripts', mockParser)
		pngConverter.setStatusTracker(tracker)
		await createTestImageFile(fileAdapter, 'a.png', 'test-image.png')
		await createTestImageFile(fileAdapter, 'b.png', 'test-image.png')
		await createTestImageFile(fileAdapter, 'c.png', 'test-image.png')

		const history: { [key: string]: string[] } = {}
		tracker.onChange(() => {
			for (const file of tracker.getAll()) {
				if (!history[file.path]) history[file.path] = []
				const h = history[file.path]
				if (h.at(-1) !== file.status) h.push(file.status)
			}
		})

		await pngConverter.convertFiles()

		for (const [path, statuses] of Object.entries(history)) {
			const doneIdx = statuses.indexOf('done')
			const processingIdx = statuses.indexOf('processing')
			if (processingIdx !== -1 && doneIdx !== -1) {
				expect(doneIdx, `${path} had 'done' before 'processing': ${statuses.join(' → ')}`).toBeGreaterThan(processingIdx)
			}
		}
	})

	it('processed canvas file ends as done in tracker', async () => {
		const canvasService = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			transcriptsFolder: 'transcripts',
		})
		canvasService.setStatusTracker(tracker)
		await createTestCanvasFile(fileDao, 'Test.canvas')

		await canvasService.convertFiles()

		const file = tracker.getAll().find((f) => f.path === 'Test.canvas')
		expect(file?.status).toBe('done')
	})
})
