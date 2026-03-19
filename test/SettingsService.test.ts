import { beforeEach, describe, expect, it } from 'vitest'
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

	it('fileFilter defaults to **/*.{canvas,pdf,png,jpg,jpeg}', () => {
		expect(service.fileFilter).toBe('**/*.{canvas,pdf,png,jpg,jpeg}')
	})

	it('updateFileFilter persists the new value', async () => {
		await service.updateFileFilter('custom/**/*.png')
		expect(service.fileFilter).toBe('custom/**/*.png')
	})

	it('restoreDefaults resets fileFilter to default', async () => {
		await service.updateFileFilter('custom/**/*.png')
		await service.restoreDefaults()
		expect(service.fileFilter).toBe('**/*.{canvas,pdf,png,jpg,jpeg}')
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
