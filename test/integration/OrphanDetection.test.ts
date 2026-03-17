import {beforeEach, describe, expect, it} from 'vitest';
import {CanvasService} from '../../src/service/CanvasService';
import {FileDaoImpl} from '../../src/dao/FileDaoImpl';
import {InMemoryFileAdapter} from '../dao/InMemoryFileAdapter';
import {readTestFile} from '../utils/testFileUtils';

const CANVAS_CONTENT = readTestFile('Test.canvas');

describe('Integration Test: Orphan Detection', () => {
	let fileAdapter: InMemoryFileAdapter;
	let fileDao: FileDaoImpl;

	beforeEach(() => {
		fileAdapter = new InMemoryFileAdapter();
		fileDao = new FileDaoImpl(fileAdapter);
	});

	it('vault-root-relative — orphan in index/ is cleaned up (no regression)', async () => {
		await fileDao.createOrUpdateFile('Test.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
		});

		await service.convertFiles();
		expect(await fileAdapter.read('index/Test.canvas.md')).toBeDefined();

		await fileAdapter.delete('Test.canvas');
		await service.convertFiles();

		await expect(fileAdapter.read('index/Test.canvas.md')).rejects.toThrow();
	});

	it('../ — deleting the source removes the orphaned index file at vault root', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		});

		await service.convertFiles();
		expect(await fileAdapter.read('Test.canvas.md')).toBeDefined();

		await fileAdapter.delete('attachments/Test.canvas');
		await service.convertFiles();

		await expect(fileAdapter.read('Test.canvas.md')).rejects.toThrow();
	});

	it('../ — two sources, one deleted → orphan removed, sibling index kept', async () => {
		await fileDao.createOrUpdateFile('attachments/A.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('attachments/B.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		});

		await service.convertFiles();
		expect(await fileAdapter.read('A.canvas.md')).toBeDefined();
		expect(await fileAdapter.read('B.canvas.md')).toBeDefined();

		await fileAdapter.delete('attachments/B.canvas');
		await service.convertFiles();

		// B orphan removed, A kept
		await expect(fileAdapter.read('B.canvas.md')).rejects.toThrow();
		expect(await fileAdapter.read('A.canvas.md')).toBeDefined();
	});

	it('./index — deleting the source removes the orphan in the relative subfolder', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: './index',
		});

		await service.convertFiles();
		expect(await fileAdapter.read('attachments/index/Test.canvas.md')).toBeDefined();

		await fileAdapter.delete('attachments/Test.canvas');
		await service.convertFiles();

		await expect(fileAdapter.read('attachments/index/Test.canvas.md')).rejects.toThrow();
	});

	it('content-marker safety — user file with .canvas.md extension in output dir is not deleted', async () => {
		await fileDao.createOrUpdateFile('attachments/Test.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: '../',
		});

		await service.convertFiles();

		// User creates their own .canvas.md note at root (no content marker)
		await fileDao.createOrUpdateFile('MyNote.canvas.md', '# My own note, no marker here');

		await fileAdapter.delete('attachments/Test.canvas');
		await service.convertFiles();

		// Plugin-generated orphan deleted, user file untouched
		await expect(fileAdapter.read('Test.canvas.md')).rejects.toThrow();
		expect(await fileAdapter.read('MyNote.canvas.md')).toBe('# My own note, no marker here');
	});
});
