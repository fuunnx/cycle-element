import { div, VNode } from '@cycle/dom'
import { Props } from 'snabbdom/modules/props'
import { Lifecycle } from './lifecycle'
import { Component, ComponentOptions, Dict } from './types'

export function snabbdomElementify(
	main: Component,
	options: ComponentOptions = {},
) {
	const { props: propsTypes, drivers = () => ({}) } = options
	const wrapperNode = div

	return function SnabbdomElement(props: Props, children?: VNode[]) {
		return wrapperNode({
			...props,
			hooks: {
				insert(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict

					elm!.lifecycle = new Lifecycle(
						elm,
						main,
						drivers,
						propsTypes || props,
					)

					props?.hooks?.insert?.(vnode)
				},
				update(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict

					if (elm!.lifecycle) {
						elm.lifecycle.update({ ...props, children })
					}

					props?.hooks?.update?.(vnode)
				},
				destroy(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict
					if (elm!.lifecycle) {
						elm.lifecycle.remove()
					}

					props?.hooks?.destroy?.(vnode)
				},
			},
		})
	}
}
