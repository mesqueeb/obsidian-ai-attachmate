export type ConversionStatus = 'pending' | 'processing' | 'done' | 'error'

export type FileStatus = {
	path: string
	status: ConversionStatus
	errorMessage?: string
}

export class ConversionStatusTracker {
	private files = new Map<string, FileStatus>()
	private subscribers = new Set<() => void>()

	clear(): void {
		this.files.clear()
		this.notify()
	}

	initFiles(paths: string[]): void {
		for (const path of paths) {
			this.files.set(path, { path, status: 'pending' })
		}
		if (paths.length > 0) this.notify()
	}

	setStatus(path: string, status: ConversionStatus, errorMessage?: string): void {
		this.files.set(path, { path, status, errorMessage })
		this.notify()
	}

	getAll(): FileStatus[] {
		return Array.from(this.files.values())
	}

	onChange(callback: () => void): () => void {
		this.subscribers.add(callback)
		return () => this.subscribers.delete(callback)
	}

	private notify(): void {
		for (const cb of this.subscribers) cb()
	}
}
