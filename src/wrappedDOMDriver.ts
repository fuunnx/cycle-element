import { MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom'
import vnode from 'snabbdom/vnode'
import { Stream } from 'xstream'

export function makeWrappedDOMDriver(renderRoot: HTMLElement) {
  return (vtree$: Stream<VNode>): MainDOMSource => {
    return makeDOMDriver(renderRoot)(
      vtree$.map(newVTree => {
        if (newVTree.sel !== 'root') {
          newVTree = vnode(
            'root',
            {},
            Array.isArray(newVTree) ? newVTree : [newVTree],
            undefined,
            renderRoot,
          )
        }

        return newVTree
      }),
    )
  }
}
