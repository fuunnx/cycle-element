import { h } from '@cycle/dom'

export function define(name: string, Component: typeof HTMLElement) {
	window.customElements.define(name, Component)

	return function snabbdomTag(...args: any[]) {
		return (h as any)(name, ...args)
	}
}
