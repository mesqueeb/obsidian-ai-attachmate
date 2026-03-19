export type ConversionStatus = 'pending' | 'processing' | 'done' | 'error'

export type FileStatus = {
	path: string
	status: ConversionStatus
	errorMessage?: string
}

export class ConversionStatusTracker {
	private files = new Map<string, FileStatus>()
	private subscribers = new Set<() => void>()

	initFiles(paths: string[]): void {
		this.files.clear()
		for (const path of paths) {
			this.files.set(path, { path, status: 'pending' })
		}
		this.notify()
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
