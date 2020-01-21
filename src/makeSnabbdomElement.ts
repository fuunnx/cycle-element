import { VNode, VNodeData, h } from '@cycle/dom'
import { Dict } from './types'
import { Children } from '@cycle/dom/lib/cjs/hyperscript-helpers'
import { ILifecycle } from './Lifecycle'
import { createElement, Component } from 'snabbdom-pragma'
import merge from 'snabbdom-merge'

function isVnode(vnode: any): vnode is VNode {
	return vnode.sel !== undefined
}

export interface makeSnabbdomElementOptions {
	wrapperNode?: string | VNode | Component | JSX.Element
}

type AugmentedHTMLElement<Props> = HTMLElement & {
	lifecycle: ILifecycle<Props>
}

export function makeSnabbdomElement<Props extends Dict = Dict>(
	makeLifeCycle: (elm: HTMLElement) => ILifecycle<Props>,
	options?: makeSnabbdomElementOptions,
) {
	const wrapperNode = options?.wrapperNode || 'div'

	return function SnabbdomElement(
		data: (VNodeData & { props: Partial<Props> } & Partial<Props>) | undefined,
		children?: (Children | string)[] | string,
	) {
		type PropsAndChildren = Props & {
			children: (Children | string)[] | string
		}
		let vnode = isVnode(wrapperNode)
			? merge(
					wrapperNode,
					createElement(wrapperNode.sel!, data || null, children as any),
			  )
			: createElement(wrapperNode, data || null, children as any)

		function insert(vnode: VNode) {
			const elm = vnode.elm as AugmentedHTMLElement<PropsAndChildren>
			elm.lifecycle = makeLifeCycle(elm)
			elm.lifecycle.update({ ...vnode.data?.props, children } as any)
		}

		function update(oldVnode: VNode, newVnode: VNode) {
			const elm = vnode.elm as AugmentedHTMLElement<PropsAndChildren>
			if (elm!.lifecycle) {
				elm.lifecycle.update({ ...vnode.data?.props, children } as any)
			}
		}

		function destroy(vnode: VNode) {
			const elm = vnode.elm as AugmentedHTMLElement<PropsAndChildren>
			if (elm!.lifecycle) {
				elm.lifecycle.remove()
			}
		}

		return merge(vnode, h(vnode.sel!, { hook: { insert, update, destroy } })
	}
}
