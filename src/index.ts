import { DOMSource, MainDOMSource, makeDOMDriver, VNode } from '@cycle/dom'
import { Driver, Drivers, setup } from '@cycle/run'
import Element, { Props } from '@skatejs/element/dist/esm'
import vnode from 'snabbdom/vnode'
import xs, { Listener, MemoryStream, Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

type callback = (props: Props) => void

interface BaseCycleComponentOptions {
  shadowRootOptions?: ShadowRootInit
  props?: Props
  drivers?: DriversFactory
}

export type DriversFactory = (element: HTMLElement) => Drivers

export interface RequiredSinks {
  DOM: Stream<any>
  [name: string]: Stream<any>
}

export interface RequiredSources {
  DOM: DOMSource
  props: PropsSource
  [name: string]: any
}

export type Component = (sources: RequiredSources) => RequiredSinks

export interface DefaultDrivers_ {
  props: Driver<Stream<Props>, PropsSource>
  DOM: Driver<Stream<VNode>, MainDOMSource>
}

export type DefaultDrivers<D> = D & DefaultDrivers_

type WithPropUpdate = Element & {
  onPropUpdate: (callback: callback) => { unsubscribe: () => void }
}

interface PropsSource {
  get: {
    (propName: string): Stream<any>
    (): Stream<Props>
  }
  dispose: () => void
}

interface AnyOptions {
  [opt: string]: any
}

// export function customElementify<
//   D extends MatchingDrivers<D, M>,
//   M extends MatchingMain<D, M>
// >(main: M, options: CycleComponentOptions<D>): typeof Element;

export function customElementify(main: Component): typeof Element
export function customElementify(
  main: Component,
  options: BaseCycleComponentOptions,
): typeof Element
export function customElementify(
  main: Component,
  options: AnyOptions = {},
): typeof Element {
  const props = options.props || {}
  const shadowRootOptions =
    'shadowRootOptions' in options ? options.shadowRootOptions : null
  let extraDrivers = options.drivers || (() => ({}))

  return class CycleComponent extends Element {
    public static props = props
    public static shadowRootOptions = shadowRootOptions

    private _propsListener: Listener<Props> = {
      next() {},
      error() {},
      complete() {},
    }

    public connectedCallback() {
      super.connectedCallback()

      if (typeof extraDrivers === 'function') {
        extraDrivers = extraDrivers(this)
      }

      const allDrivers = {
        ...this.mandatoryDrivers(),
        ...extraDrivers,
      }
      const { sinks, run } = setup(main as any, allDrivers)
      Object.entries(sinks).forEach(([key, value$]) => {
        if (key in allDrivers) {
          return
        }
        if (key.endsWith('$')) {
          ;(this as any)[key] = value$ as Stream<any>
        } else {
          ;(value$ as Stream<any>).subscribe({
            next: value => {
              this.dispatchEvent(new CustomEvent(key, { detail: value }))
            },
          })
        }
      })

      const dispose = run()
      this._cleanup = () => {
        dispose()
      }
    }

    public disconnectedCallback() {
      super.disconnectedCallback()
      this._cleanup()
    }

    public updated(props: Props) {
      super.updated(props)
      const newProps = Object.keys(props).reduce(
        (acc, key) => {
          if (acc[key] !== (this as any)[key]) {
            acc[key] = (this as any)[key]
          }
          return acc
        },
        {} as { [k: string]: any },
      )
      this._propsListener.next(newProps)
    }

    public renderer() {
      // do nothing
    }

    private mandatoryDrivers() {
      const $element = this
      return {
        props: $element.makePropsDriver(),
        DOM: (vtree$: Stream<VNode>) => {
          const root = $element.renderRoot as HTMLElement

          return makeDOMDriver(root)(
            vtree$
              .map(newVTree => {
                return vnode(
                  'root',
                  {},
                  Array.isArray(newVTree) ? newVTree : [newVTree],
                  undefined,
                  root,
                )
              })
              .startWith(vnode('root', {}, [], undefined, root)),
          )
        },
      }
    }

    private makePropsDriver() {
      const $element = this
      const props = $element.constructor.props || {}
      Object.keys(props).forEach(key => {
        ;($element as any)[key + '$'] = xs.createWithMemory()
      })

      return function propsDriver(setProp$: Stream<Props>): PropsSource {
        const subscription = setProp$.subscribe({
          next: (newProps: { [key: string]: any }) => {
            Object.entries(newProps).forEach(([key, value]) => {
              if (key in ($element.constructor.props || {})) {
                if (($element as any)[key] !== value) {
                  ;($element as any)[key] = value
                  ;($element as any)[key + '$'].shamefullySendNext(value)
                }
              }
            })
          },
          error: (error: Error | string) => {
            throw error
          },
        })

        let elSubscription: { unsubscribe: () => void } | undefined
        const props$: Stream<Props> = xs
          .createWithMemory({
            start(listener) {
              $element._propsListener = listener
              listener.next(($element as any)._props)
            },
            stop() {
              elSubscription && elSubscription.unsubscribe()
            },
          })
          .fold(
            (acc: Props, x) => ({ ...acc, ...(x as Props) } as Props),
            {} as Props,
          )

        return {
          get(propName?: string) {
            if (!propName) {
              return props$.compose(dropRepeats()) as MemoryStream<Props>
            }

            return props$
              .filter(props => propName in props)
              .map(props => props[propName])
              .startWith(($element as any)[propName])
              .compose(dropRepeats())
              .remember() as MemoryStream<any>
          },
          dispose: () => {
            subscription.unsubscribe()
          },
        }
      }
    }

    private _cleanup = () => {}
  }
}
