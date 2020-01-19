import { Lifecycle, CycleComponentOptions } from './lifecycle'
import { Component, Dict } from './types'
import {
	makeSnabbdomElementOptions,
	makeSnabbdomElement,
} from './makeSnabbdomElement'

export function snabbdomElementify<Props extends Dict = Dict>(
	main: Component<Props>,
	options: CycleComponentOptions & makeSnabbdomElementOptions = {},
) {
	const { props, drivers = () => ({}) } = options

	return makeSnabbdomElement((elm: HTMLElement) => {
		return new Lifecycle<Props>(elm, main, drivers, props || {})
	})
}
