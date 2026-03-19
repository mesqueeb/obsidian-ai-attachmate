import { ConversionStatus, FileStatus } from '../service/ConversionStatusTracker'

const SECTION_ORDER: ConversionStatus[] = ['error', 'processing', 'pending', 'done']
const SECTION_LABELS = {
	error: 'Error',
	processing: 'Processing',
	pending: 'Pending',
	done: 'Done',
}

function splitPath(filePath: string): { folder: string; name: string } {
	const lastSlash = filePath.lastIndexOf('/')
	if (lastSlash === -1) return { folder: '', name: filePath }
	return {
		folder: filePath.slice(0, lastSlash),
		name: filePath.slice(lastSlash + 1),
	}
}

function groupByFolder(files: FileStatus[]): { folder: string; files: FileStatus[] }[] {
	const order: string[] = []
	const map = new Map<string, FileStatus[]>()
	for (const file of files) {
		const { folder } = splitPath(file.path)
		if (!map.has(folder)) {
			order.push(folder)
			map.set(folder, [])
		}
		const folderArr = map.get(folder)
		if (folderArr) folderArr.push(file)
	}
	return order.map((folder) => ({ folder, files: map.get(folder) ?? [] }))
}

/**
 * Renders the status content into the given container using Obsidian DOM APIs.
 *
 * Per the
 * {@link https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Security Obsidian plugin guidelines},
 * `innerHTML` must never be used — DOM methods like `createEl()` and `createDiv()` are required
 * instead.
 */
export function renderStatusContent(container: HTMLElement, files: FileStatus[]): void {
	if (files.length === 0) {
		container.createEl('p', {
			cls: 'attachmate-empty',
			text: 'No files tracked yet. Run the converter to see status.',
		})
		return
	}

	const grouped = new Map<ConversionStatus, FileStatus[]>()
	for (const status of SECTION_ORDER) grouped.set(status, [])
	for (const file of files) grouped.get(file.status)?.push(file)

	const isProcessing = (grouped.get('processing')?.length ?? 0) > 0

	const wrapper = container.createDiv({ cls: 'attachmate-scroll-wrapper' })
	const table = wrapper.createEl('table', { cls: 'attachmate-status-table' })
	const tbody = table.createEl('tbody')

	for (const status of SECTION_ORDER) {
		const group = grouped.get(status) ?? []
		if (group.length === 0) continue

		const headerRow = tbody.createEl('tr', { cls: 'attachmate-section-header' })
		const headerCell = headerRow.createEl('td')
		headerCell.setAttr('colspan', '2')
		headerCell.appendText(`${SECTION_LABELS[status]} (${group.length})`)
		if (status === 'processing' && isProcessing) {
			headerCell.createEl('span', { cls: 'attachmate-spinner' })
		}

		for (const { folder, files: folderFiles } of groupByFolder(group)) {
			folderFiles.forEach((file, i) => {
				const { name } = splitPath(file.path)
				const row = tbody.createEl('tr')

				if (i === 0) {
					const folderCell = row.createEl('td', { cls: 'attachmate-folder' })
					folderCell.setAttr('rowspan', String(folderFiles.length))
					folderCell.createDiv({ cls: 'attachmate-folder-sticky', text: folder })
				}

				const nameCell = row.createEl('td', { cls: 'attachmate-filename' })
				nameCell.appendText(name)
				if (file.errorMessage) {
					nameCell.createEl('span', { cls: 'attachmate-error-msg', text: file.errorMessage })
				}
			})
		}
	}
}
