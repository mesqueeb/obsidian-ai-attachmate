import { beforeEach, describe, expect, it } from 'vitest'
import { FileDaoImpl } from '../../src/dao/FileDaoImpl'
import { CanvasService } from '../../src/service/CanvasService'
import { InMemoryFileAdapter } from '../dao/InMemoryFileAdapter'
import { readTestFile } from '../utils/testFileUtils'

const CANVAS_CONTENT = readTestFile('Test.canvas')

describe('Integration Test: Relative Index Folder', () => {
	let fileAdapter: InMemoryFileAdapter
	let fileDao: FileDaoImpl

	beforeEach(() => {
		fileAdapter = new InMemoryFileAdapter()
		fileDao = new FileDaoImpl(fileAdapter)
	})

	it('../ with source attachments/file.canvas → output at file.canvas.md (vault root)', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('Test.canvas.md')).toBeDefined()
	})

	it('./index with source attachments/file.canvas → output at attachments/index/file.canvas.md', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: './index',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('attachments/index/Test.canvas.md')).toBeDefined()
	})

	it('../ with source a/b/attachments/file.canvas → output at a/b/file.canvas.md', async () => {
		await fileDao.createOrUpdateFile('a/b/attachments/Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('a/b/Test.canvas.md')).toBeDefined()
	})

	it('../ with source file.canvas at vault root → output at file.canvas.md (clamped, no error)', async () => {
		await fileDao.createOrUpdateFile('Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('Test.canvas.md')).toBeDefined()
	})

	it('vault-root-relative "index" → output at index/file.canvas.md (no regression)', async () => {
		await fileDao.createOrUpdateFile('Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('index/Test.canvas.md')).toBeDefined()
	})

	it('slash normalization: "/index", "index", "index/" all produce index/file.canvas.md', async () => {
		for (const indexFolder of ['/index', 'index', 'index/']) {
			fileAdapter.clear()
			await fileDao.createOrUpdateFile('Test.canvas', CANVAS_CONTENT)

			const service = new CanvasService(fileDao, {
				canvasPostfix: '.canvas.md',
				runOnStart: false,
				indexFolder,
			})
			await service.convertFiles()

			expect(
				await fileAdapter.read('index/Test.canvas.md'),
				`indexFolder="${indexFolder}"`,
			).toBeDefined()
		}
	})

	it('./ places output alongside source file', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT)

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: './',
		})
		await service.convertFiles()

		expect(await fileAdapter.read('attachments/Test.canvas.md')).toBeDefined()
	})
})
