import { timeDriver } from '@cycle/time'
import xs, { MemoryStream, Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { _PropsDriver, Dict, Props, PropsSource } from './types'

const Time = timeDriver(xs.empty())

const noopListener = {
  next(x: unknown) {},
  error(x: unknown) {},
  complete(x: unknown) {},
}

export function makePropsDriver(elm: HTMLElement, props: Props) {
  const $element = elm as HTMLElement & Dict
  const propsNames = Object.keys(props)
  let propsSourcesListener = noopListener

  const initialProps = getAllProps(propsNames, $element)
  const propsSource$: Stream<Props> = xs
    .createWithMemory({
      start(listener) {
        propsSourcesListener = listener
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

  function propsDriver(propsSink$: Stream<Props> = xs.never()): PropsSource {
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

  Object.assign(propsDriver, {
    next(nextProps: Props) {
      const newProps = getAllProps(Object.keys(nextProps), elm)
      propsSourcesListener.next(newProps)
    },
  })

  return propsDriver as _PropsDriver
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
