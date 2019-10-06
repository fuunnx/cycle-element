import { makeDOMDriver, VNode } from '@cycle/dom'
import { setup } from '@cycle/run'
import { timeDriver } from '@cycle/time'
import Element, { Props } from '@skatejs/element/dist/esm'
import vnode from 'snabbdom/vnode'
import xs, { Listener, MemoryStream, Stream, Subscription } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { Component, Dict, PropsSource } from './types'

const Time = timeDriver(xs.empty())

const noopListener = {
  next() {},
  error() {},
  complete() {},
}

export class CycleComponent extends Element {
  get drivers() {
    return {}
  }
  public static props = {}
  public static shadowRootOptions = undefined
  public static main: Component = () => ({})

  private _propsSourcesListener: Listener<Props> = noopListener
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

  public updated(oldProps: Props) {
    super.updated(oldProps)
    const $element = this as CycleComponent & Dict
    const newProps = getAllProps(Object.keys(oldProps), $element)
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
    const propsNames = Object.keys(props)

    const initialProps = getAllProps(propsNames, $element)
    const propsSource$: Stream<Props> = xs
      .createWithMemory({
        start(listener) {
          $element._propsSourcesListener = listener
          listener.next(getAllProps(propsNames, $element))
        },
        stop() {
          //
        },
      })
      .fold((acc: Props, x) => ({ ...acc, ...x } as Props), initialProps)

    const propsSource = {
      get(propName?: string) {
        if (!propName) {
          return propsSource$
            .startWith(getAllProps(propsNames, $element))
            .compose(dropRepeats()) as MemoryStream<Props>
        }

        return propsSource$
          .filter(currProps => propName in currProps)
          .map(currProps => currProps[propName])
          .startWith($element[propName])
          .compose(dropRepeats())
          .remember() as MemoryStream<any>
      },
    }

    propsNames.forEach(key => {
      let source$ = xs.never()
      let subscription = source$.subscribe({})

      Object.defineProperty($element, key + '$', {
        get() {
          return xs
            .merge(
              source$.compose(Time.delay(0)), // there is a weird glitch on ordering
              propsSource.get(key),
            )
            .remember()
        },
        set(value$: Stream<any>) {
          if (value$ === source$) {
            return
          }

          subscription.unsubscribe()
          source$ = value$
          subscription = source$.subscribe({
            next(val) {
              $element[key] = val
            },
          })
        },
      })
    })

    return function propsDriver(propsSink$: Stream<Props>): PropsSource {
      const subscription = propsSink$.subscribe({
        next: (newProps: Props) => {
          Object.entries(newProps).forEach(([key, value]) => {
            if (key in props) {
              $element[key] = value
            }
          })
        },
        error: (error: Error | string) => {
          throw error
        },
      })

      return Object.assign(propsSource, {
        dispose() {
          subscription.unsubscribe()
        },
      })
    }
  }
}

function getAllProps(propsNames: string[], $element: Dict) {
  return propsNames.reduce(
    (acc, propName) => {
      acc[propName] = $element[propName]
      return acc
    },
    {} as Props,
  )
}
