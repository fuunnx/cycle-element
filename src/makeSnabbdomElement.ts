import { VNode, VNodeData } from '@cycle/dom'
import { Dict } from './types'
import { Children } from '@cycle/dom/lib/cjs/hyperscript-helpers'
import { ILifecycle } from './Lifecycle'
import { createElement, Component } from 'snabbdom-pragma'
import merge from 'snabbdom-merge'

function isVnode(vnode: any): vnode is VNode {
	return vnode.sel !== undefined
}

export interface makeSnabbdomElementOptions {
	wrapperNode?: string | VNode | Component
}

export function makeSnabbdomElement<Props extends Dict = Dict>(
	makeLifeCycle: (elm: HTMLElement) => ILifecycle<Props>,
	options?: makeSnabbdomElementOptions,
) {
	const wrapperNode = options?.wrapperNode || 'div'

	return function SnabbdomElement(
		data: (VNodeData & { props: Partial<Props> } & Partial<Props>) | undefined,
		children?: (Children | string)[] | string | any,
	) {
		let vnode = isVnode(wrapperNode)
			? merge(
					wrapperNode,
					createElement(wrapperNode.sel, data, children as any),
			  )
			: createElement(wrapperNode, data, children as any)

		vnode.data.hook = vnode.data.hook || {}
		vnode.data.hook.insert = function insert(vnode: VNode) {
			const elm = vnode.elm as HTMLElement & Dict
			elm.lifecycle = makeLifeCycle(elm)
			elm.lifecycle.update({ ...vnode.data.props, children })

			vnode.data.hook?.insert(vnode)
		}

		vnode.data.hook.update = function update(oldVnode: VNode, newVnode: VNode) {
			const elm = vnode.elm as HTMLElement & Dict
			if (elm!.lifecycle) {
				elm.lifecycle.update({ ...vnode.data.props, children })
			}

			vnode.data.hook?.update(oldVnode, newVnode)
		}

		vnode.data.hook.destroy = function destroy(vnode: VNode) {
			const elm = vnode.elm as HTMLElement & Dict
			if (elm!.lifecycle) {
				elm.lifecycle.remove()
			}

			vnode.data.hook?.destroy(vnode)
		}

		return vnode
	}
}
