import { Lifecycle, CycleComponentOptions } from './lifecycle'
import { Component, Dict } from './types'
import {
	makeSkateElement,
	makeSkateElementOptions,
	SkateElement,
} from './makeSkateElement'

export function customElementify<Props extends Dict = Dict>(
	main: Component,
	options: CycleComponentOptions & makeSkateElementOptions<Props> = {},
): typeof SkateElement {
	let { props = {}, drivers = () => ({}) } = options || {}

	return makeSkateElement((elm: HTMLElement) => {
		return new Lifecycle(elm, main, drivers, props || {})
	}, options)
}
