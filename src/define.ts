import { h } from '@cycle/dom'
import { CycleComponent } from './CycleComponent'

export function define(name: string, Component: typeof CycleComponent) {
	window.customElements.define(name, Component)

	return function snabbdomTag(...args: any[]) {
		return (h as any)(name, ...args)
	}
}
