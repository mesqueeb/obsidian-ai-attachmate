export type AdapterFile = {
	path: string
	name: string
	modifiedTime: number
	sizeInBytes: number
}

export type FileAdapter = {
	createFolder(folderPath: string): Promise<void>

	getFiles(): AdapterFile[]

	read(filePath: string): Promise<string>

	readBinary(filePath: string): Promise<ArrayBuffer>

	create(filePath: string, content: string): Promise<void>

	delete(path: string): Promise<void>

	modify(filePath: string, content: string): Promise<void>
}
