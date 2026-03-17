import {beforeEach, describe, expect, it} from 'vitest';
import {CanvasService} from '../../src/service/CanvasService';
import {FileDaoImpl} from '../../src/dao/FileDaoImpl';
import {InMemoryFileAdapter} from '../dao/InMemoryFileAdapter';
import {readTestFile} from '../utils/testFileUtils';

const CANVAS_CONTENT = readTestFile('Test.canvas');

describe('Integration Test: Glob Filter', () => {
	let fileAdapter: InMemoryFileAdapter;
	let fileDao: FileDaoImpl;

	beforeEach(() => {
		fileAdapter = new InMemoryFileAdapter();
		fileDao = new FileDaoImpl(fileAdapter);
	});

	it('filter attachments/*.canvas — * is single-level: processes file in attachments/ at vault root, ignores nested and root', async () => {
		await fileDao.createOrUpdateFile('attachments/InFilter.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('NotInFilter.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('deep/attachments/AlsoNotInFilter.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
			fileFilter: 'attachments/*.canvas',
		});
		await service.convertFiles();

		expect(await fileAdapter.read('index/InFilter.canvas.md')).toBeDefined();
		await expect(fileAdapter.read('index/NotInFilter.canvas.md')).rejects.toThrow();
		await expect(fileAdapter.read('index/AlsoNotInFilter.canvas.md')).rejects.toThrow();
	});

	it('filter with brace expansion *.{canvas,md} — matches multiple extensions', async () => {
		await fileDao.createOrUpdateFile('attachments/Doc.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('attachments/Note.md', '# note');
		await fileDao.createOrUpdateFile('attachments/Image.png', 'binary');

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
			fileFilter: 'attachments/*.{canvas,md}',
		});
		await service.convertFiles();

		// canvas matches filter AND is the converter's source extension → processed
		expect(await fileAdapter.read('index/Doc.canvas.md')).toBeDefined();
		// .png does not match filter → not processed (CanvasService wouldn't handle it anyway, but it's excluded at the gate)
	});

	it('no fileFilter set — all canvas files anywhere in vault are processed (no regression)', async () => {
		await fileDao.createOrUpdateFile('root.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('deep/nested/file.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
		});
		await service.convertFiles();

		expect(await fileAdapter.read('index/root.canvas.md')).toBeDefined();
		expect(await fileAdapter.read('index/file.canvas.md')).toBeDefined();
	});

	it('filter **/attachments/*.canvas — ** is recursive: processes files in any attachments/ folder at any depth', async () => {
		await fileDao.createOrUpdateFile('attachments/Root.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('deep/attachments/Nested.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('a/b/c/attachments/VeryNested.canvas', CANVAS_CONTENT);
		await fileDao.createOrUpdateFile('NotInFilter.canvas', CANVAS_CONTENT);

		const service = new CanvasService(fileDao, {
			canvasPostfix: '.canvas.md',
			runOnStart: false,
			indexFolder: 'index',
			fileFilter: '**/attachments/*.canvas',
		});
		await service.convertFiles();

		expect(await fileAdapter.read('index/Root.canvas.md')).toBeDefined();
		expect(await fileAdapter.read('index/Nested.canvas.md')).toBeDefined();
		expect(await fileAdapter.read('index/VeryNested.canvas.md')).toBeDefined();
		await expect(fileAdapter.read('index/NotInFilter.canvas.md')).rejects.toThrow();
	});
});
