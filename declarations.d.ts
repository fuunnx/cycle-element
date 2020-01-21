declare module 'snabbdom-merge' {
	import { VNode } from 'snabbdom/vnode'

	export default function merge(vnode1: VNode, vnode2: VNode): VNode
}
