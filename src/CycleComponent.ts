import Element from '@skatejs/element/dist/esm'
import { Lifecycle } from './lifecycle'
import { Component, Dict } from './types'

export class CycleComponent<Props extends Dict = Dict> extends Element {
	get drivers() {
		return {}
	}
	public static props = {}
	public static shadowRootOptions = undefined
	public static main: Component = () => ({})
	public lifecycle!: Lifecycle<Props>

	public connectedCallback() {
		super.connectedCallback()
		const main = (this.constructor as any).main
		this.lifecycle = new Lifecycle(
			this,
			main,
			() => this.drivers,
			(this.constructor as any).props,
		)
	}

	public updated(oldProps: Props) {
		super.updated(oldProps)
		this.lifecycle.update(oldProps)
	}

	public disconnectedCallback() {
		super.disconnectedCallback()
		this.lifecycle.remove()
	}

	public renderer() {
		// do nothing
	}
}
