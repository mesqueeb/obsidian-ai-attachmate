/** Minimal fake HTMLElement that implements the Obsidian DOM API used by renderStatusContent. */
export class FakeEl {
	readonly tagName: string
	private _cls: string
	private _attrs: [string, string][] = []
	private _children: (FakeEl | string)[] = []

	constructor(tag: string, cls = '') {
		this.tagName = tag
		this._cls = cls
	}

	createEl(tag: string, opts: { cls?: string; text?: string } = {}): FakeEl {
		const el = new FakeEl(tag, opts.cls)
		if (opts.text != null) el._children.push(opts.text)
		this._children.push(el)
		return el
	}

	createDiv(opts: { cls?: string; text?: string } = {}): FakeEl {
		return this.createEl('div', opts)
	}

	appendText(text: string): void {
		this._children.push(text)
	}

	setAttr(name: string, value: string): void {
		this._attrs.push([name, value])
	}

	empty(): void {
		this._children = []
	}

	get innerHTML(): string {
		return this._children.map((c) => (typeof c === 'string' ? c : c.outerHTML)).join('')
	}

	get outerHTML(): string {
		const cls = this._cls ? ` class="${this._cls}"` : ''
		const attrs = this._attrs.map(([k, v]) => ` ${k}="${v}"`).join('')
		return `<${this.tagName}${cls}${attrs}>${this.innerHTML}</${this.tagName}>`
	}
}
