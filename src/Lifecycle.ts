import { Drivers, setup } from '@cycle/run'
import { Stream, Subscription } from 'xstream'
import { makePropsDriver } from './propsDriver'
import { _PropsDriver, Component, Dict, Props } from './types'
import { makeWrappedDOMDriver } from './wrappedDOMDriver'

export class Lifecycle {
  private elm: HTMLElement & Dict
  private subscriptions: Dict<Subscription> = {}
  private propsDriver: _PropsDriver

  constructor(
    elm: HTMLElement,
    main: Component,
    makeDrivers: (elm: HTMLElement) => Drivers,
    props: {},
  ) {
    this.elm = elm
    this.propsDriver = makePropsDriver(elm, props)

    const drivers = {
      props: this.propsDriver as any,
      DOM: makeWrappedDOMDriver((this.elm.renderRoot as HTMLElement) || elm),
      ...makeDrivers(elm),
    }

    const { sinks, run } = setup(main as any, drivers)

    Object.entries(sinks).forEach(([key, value$]) => {
      if (key in drivers) {
        return
      }

      if (key.endsWith('$')) {
        this.elm[key] = value$ as Stream<any>
      } else {
        this.subscriptions[key] = (value$ as Stream<any>).subscribe({
          next: value => {
            this.elm.dispatchEvent(new CustomEvent(key, { detail: value }))
          },
        })
      }
    })

    const dispose = run()
    this.remove = () => {
      dispose()
      Object.values(this.subscriptions).forEach(sub => {
        sub.unsubscribe()
      })
    }
  }

  public update(updated: Props) {
    this.propsDriver.next(updated)
  }

  public remove = () => {}
}
