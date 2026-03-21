import { App, TFile, normalizePath } from 'obsidian'
import { AdapterFile, FileAdapter } from './FileAdapter'

export class ObsidianFileAdapter implements FileAdapter {
	constructor(private app: App) {}

	getFiles(): AdapterFile[] {
		const files = this.app.vault.getFiles()
		return files.map((file) => ({
			path: file.path,
			name: file.name,
			modifiedTime: file.stat.mtime,
			sizeInBytes: file.stat.size,
		}))
	}

	async createFolder(folderPath: string): Promise<void> {
		const normalized = normalizePath(folderPath)
		if (!this.app.vault.getAbstractFileByPath(normalized)) {
			await this.app.vault.createFolder(normalized)
		}
	}

	read(filePath: string): Promise<string> {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath))
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File not found: ${filePath}`)
		}
		return this.app.vault.read(file)
	}

	async create(filePath: string, content: string): Promise<void> {
		await this.app.vault.create(normalizePath(filePath), content)
	}

	async modify(filePath: string, content: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath))
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File not found: ${filePath}`)
		}
		await this.app.vault.modify(file, content)
	}

	async delete(filePath: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath))
		if (!file) {
			throw new Error(`File not found: ${filePath}`)
		}
		await this.app.fileManager.trashFile(file)
	}

	readBinary(filePath: string): Promise<ArrayBuffer> {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath))
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File not found: ${filePath}`)
		}
		return this.app.vault.readBinary(file)
	}
}
