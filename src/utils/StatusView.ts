import { ItemView, WorkspaceLeaf } from 'obsidian'
import { ConversionStatusTracker } from '../service/ConversionStatusTracker'
import { renderStatusContent } from './renderStatusContent'

export const STATUS_VIEW_TYPE = 'ai-attachmate-status'

export class StatusView extends ItemView {
	private tracker: ConversionStatusTracker
	private unsubscribe?: () => void

	constructor(leaf: WorkspaceLeaf, tracker: ConversionStatusTracker) {
		super(leaf)
		this.tracker = tracker
	}

	getViewType(): string {
		return STATUS_VIEW_TYPE
	}

	getDisplayText(): string {
		return 'AI Attachmate Status'
	}

	getIcon(): string {
		return 'list-checks'
	}

	async onOpen(): Promise<void> {
		this.unsubscribe = this.tracker.onChange(() => this.render())
		this.render()
	}

	async onClose(): Promise<void> {
		this.unsubscribe?.()
	}

	private render(): void {
		const files = this.tracker.getAll()
		const container = this.containerEl.children[1] as HTMLElement
		container.empty()
		if (files.length === 0) {
			container.createEl('p', {
				cls: 'attachmate-empty',
				text: 'No files tracked yet. Run the converter to see status.',
			})
		} else {
			container.innerHTML = renderStatusContent(files)
		}
	}
}
