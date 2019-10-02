import { makeDOMDriver, VNode } from '@cycle/dom'
import { setup } from '@cycle/run'
import Element, { Props } from '@skatejs/element/dist/esm'
import vnode from 'snabbdom/vnode'
import xs, { Listener, MemoryStream, Stream, Subscription } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { Component, Dict, PropsSource } from './types'

export class CycleComponent extends Element {
  get drivers() {
    return {}
  }
  public static props = {}
  public static shadowRootOptions = undefined
  public static main: Component = () => ({})

  private _propsSourcesListener: Listener<Props> = {
    next() {},
    error() {},
    complete() {},
  }
  private _subscriptions: Dict<Subscription> = {}

  public connectedCallback() {
    super.connectedCallback()
    const main = (this.constructor as any).main
    const allDrivers = { ...this._defaultDrivers(), ...this.drivers }
    const { sinks, run } = setup(main, allDrivers)
    const $element = this as CycleComponent & Dict

    Object.entries(sinks).forEach(([key, value$]) => {
      if (key in allDrivers) {
        return
      }

      if (key.endsWith('$')) {
        $element[key] = value$ as Stream<any>
      } else {
        this._subscriptions[key] = (value$ as Stream<any>).subscribe({
          next: value => {
            this.dispatchEvent(new CustomEvent(key, { detail: value }))
          },
        })
      }
    })

    const dispose = run()
    this._cleanup = () => {
      dispose()
      Object.values(this._subscriptions).forEach(sub => {
        sub.unsubscribe()
      })
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this._cleanup()
  }

  public updated(props: Props) {
    super.updated(props)
    const $element = this as CycleComponent & Dict
    const newProps = Object.keys(props).reduce(
      (acc, key) => {
        if (acc[key] !== $element[key]) {
          acc[key] = $element[key]
        }
        return acc
      },
      {} as Props,
    )
    this._propsSourcesListener.next(newProps)
  }

  public renderer() {
    // do nothing
  }

  private _cleanup = () => {}

  private _defaultDrivers() {
    return {
      props: this._makePropsDriver(),
      DOM: (vtree$: Stream<VNode>) => {
        const renderRoot = this.renderRoot as HTMLElement

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
      },
    }
  }

  private _makePropsDriver() {
    const $element = this as (CycleComponent & Dict)
    const props = this.constructor.props || {}
    const propsSinksListeners: Dict<Listener<any> | undefined> = {}

    Object.keys(props).forEach(key => {
      $element[key + '$'] = xs.createWithMemory({
        start(listener) {
          propsSinksListeners[key] = listener
        },
        stop() {
          propsSinksListeners[key] = undefined
        },
      })
    })

    return function propsDriver(propsSink$: Stream<Props>): PropsSource {
      const subscription = propsSink$.subscribe({
        next: (newProps: Props) => {
          Object.entries(newProps).forEach(([key, value]) => {
            if (key in props && $element[key] !== value) {
              const listener = propsSinksListeners[key]
              if (listener) {
                listener.next(value)
              }
              $element[key] = value
            }
          })
        },
        error: (error: Error | string) => {
          throw error
        },
      })

      const propsSource$: Stream<Props> = xs
        .createWithMemory({
          start(listener) {
            $element._propsSourcesListener = listener
            listener.next(($element as any)._props)
          },
          stop() {
            //
          },
        })
        .fold((acc: Props, x) => ({ ...acc, ...x } as Props), {} as Props)

      return {
        get(propName?: string) {
          if (!propName) {
            return propsSource$.compose(dropRepeats()) as MemoryStream<Props>
          }

          return propsSource$
            .filter(currProps => propName in currProps)
            .map(currProps => currProps[propName])
            .startWith($element[propName])
            .compose(dropRepeats())
            .remember() as MemoryStream<any>
        },
        dispose: () => {
          subscription.unsubscribe()
        },
      }
    }
  }
}
