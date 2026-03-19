import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_FILE_FILTER, DEFAULT_PROMPT, DEFAULT_TEMPLATE } from '../src/utils/constants'
import { SettingsServiceImpl } from '../src/service/SettingsService'

function makePlugin(): Plugin {
	return {
		loadData: async (): Promise<unknown> => ({}),
		saveData: async (): Promise<void> => { /* no-op */ },
	} as unknown as Plugin
}

describe('SettingsService', () => {
	let service: SettingsServiceImpl

	beforeEach(() => {
		service = new SettingsServiceImpl(makePlugin())
	})

	it('template defaults to a non-empty string matching DEFAULT_TEMPLATE', () => {
		expect(typeof DEFAULT_TEMPLATE).toBe('string')
		expect(DEFAULT_TEMPLATE.length).toBeGreaterThan(0)
		expect(service.template).toBe(DEFAULT_TEMPLATE)
	})

	it('updateTemplate persists the new value', async () => {
		await service.updateTemplate('custom template')
		expect(service.template).toBe('custom template')
	})

	it('restoreDefaults resets template to DEFAULT_TEMPLATE', async () => {
		await service.updateTemplate('custom template')
		await service.restoreDefaults()
		expect(service.template).toBe(DEFAULT_TEMPLATE)
	})

	it('prompt defaults to a non-empty string matching DEFAULT_PROMPT', () => {
		expect(typeof DEFAULT_PROMPT).toBe('string')
		expect(DEFAULT_PROMPT.length).toBeGreaterThan(0)
		expect(service.prompt).toBe(DEFAULT_PROMPT)
	})

	it('updatePrompt persists the new value', async () => {
		await service.updatePrompt('custom prompt')
		expect(service.prompt).toBe('custom prompt')
	})

	it('restoreDefaults resets prompt to DEFAULT_PROMPT', async () => {
		await service.updatePrompt('custom prompt')
		await service.restoreDefaults()
		expect(service.prompt).toBe(DEFAULT_PROMPT)
	})

	it('fileFilter defaults to DEFAULT_FILE_FILTER', () => {
		expect(service.fileFilter).toBe(DEFAULT_FILE_FILTER)
	})

	it('updateFileFilter persists the new value', async () => {
		await service.updateFileFilter('custom/**/*.png')
		expect(service.fileFilter).toBe('custom/**/*.png')
	})

	it('restoreDefaults resets fileFilter to DEFAULT_FILE_FILTER', async () => {
		await service.updateFileFilter('custom/**/*.png')
		await service.restoreDefaults()
		expect(service.fileFilter).toBe(DEFAULT_FILE_FILTER)
	})

	describe('updateIndexFolder', () => {
		it('accepts a 2-character value like "./"', async () => {
			await service.updateIndexFolder('./')
			expect(service.indexFolder).toBe('./')
		})

		it('accepts a 3-character value like "../"', async () => {
			await service.updateIndexFolder('../')
			expect(service.indexFolder).toBe('../')
		})

		it('falls back to "index" for a 1-character value', async () => {
			await service.updateIndexFolder('x')
			expect(service.indexFolder).toBe('index')
		})

		it('falls back to "index" for an empty string', async () => {
			await service.updateIndexFolder('')
			expect(service.indexFolder).toBe('index')
		})
	})
})
