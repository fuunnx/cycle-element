import { div, VNode } from '@cycle/dom'
import { Dict } from './types'
import { HyperScriptHelperFn } from '@cycle/dom/lib/cjs/hyperscript-helpers'
import { ILifecycle } from './Lifecycle'

export interface makeSnabbdomElementOptions {
	wrapperNode?: HyperScriptHelperFn
}

export function makeSnabbdomElement<Props extends Dict = Dict>(
	makeLifeCycle: (elm: HTMLElement) => ILifecycle<Props>,
	options?: makeSnabbdomElementOptions,
) {
	const wrapperNode = options?.wrapperNode || div

	return function SnabbdomElement(props: Props, children?: VNode[]) {
		return wrapperNode({
			...props,
			hook: {
				insert(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict
					elm.lifecycle = makeLifeCycle(elm)
					elm.lifecycle.update({ ...props, children })

					props?.hook?.insert?.(vnode)
				},
				update(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict
					if (elm!.lifecycle) {
						elm.lifecycle.update({ ...props, children })
					}

					props?.hook?.update?.(vnode)
				},
				destroy(vnode: VNode) {
					const elm = vnode.elm as HTMLElement & Dict
					if (elm!.lifecycle) {
						elm.lifecycle.remove()
					}

					props?.hook?.destroy?.(vnode)
				},
			},
		})
	}
}
