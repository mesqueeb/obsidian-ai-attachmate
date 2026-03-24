import * as fs from 'fs'
import * as path from 'path'
import { FileDao } from '../../src/dao/FileDao'
import { InMemoryFileAdapter } from '../dao/InMemoryFileAdapter'

export function readTestFile(testFileName: string): string {
	return fs.readFileSync(
		path.resolve(import.meta.dirname, `../../test-data/${testFileName}`),
		'utf-8',
	)
}

export function createTestCanvasFile(fileDao: FileDao, testFileName: string): Promise<void> {
	const canvasFilePath = testFileName
	const canvasContent = readTestFile(testFileName)
	return fileDao.createOrUpdateFile(canvasFilePath, canvasContent)
}

export function generateTestCanvasFile(): string {
	return readTestFile('Test.canvas')
}

export function readGeneratedTestFile(fileName: string, postfix = '', targetFolder = 'transcripts'): string {
	const baseName = fileName.replace(postfix, '')
	const templateContent = readTestFile('Test.canvas.md')
	const depth = targetFolder.split('/').length
	const relativePrefix = '../'.repeat(depth)
	return templateContent
		.replace(/\(\.\.\/Test\.canvas\)/g, `(${relativePrefix}${baseName}.canvas)`)
		.replace(/\[Test\.canvas\]/g, `[${baseName}.canvas]`)
}

export function readTestBinaryFile(testFileName: string): ArrayBuffer {
	const buffer = fs.readFileSync(
		path.resolve(import.meta.dirname, `../../test-data/${testFileName}`),
	)
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

export function createTestImageFile(
	adapter: InMemoryFileAdapter,
	testFileName: string,
	contentFileName = testFileName,
): Promise<void> {
	const imageFilePath = testFileName
	const imageContent = readTestBinaryFile(contentFileName)
	return adapter.createOrUpdateBinaryFile(imageFilePath, imageContent)
}
