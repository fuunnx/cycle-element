import { Lifecycle } from './lifecycle'
import { Component, CycleComponentOptions, Dict } from './types'
import {
	makeSnabbdomElementOptions,
	makeSnabbdomElement,
} from './makeSnabbdomElement'

export function snabbdomElementify<Props extends Dict = Dict>(
	main: Component<Props>,
	options: CycleComponentOptions & makeSnabbdomElementOptions<Props> = {},
) {
	const { props, drivers = () => ({}) } = options

	return makeSnabbdomElement((elm: HTMLElement) => {
		return new Lifecycle<Props>(elm, main, drivers, props || {})
	})
}
