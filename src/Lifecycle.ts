import { objectKeys } from 'simplytyped'
import { Drivers, setup } from '@cycle/run'
import { Stream, Subscription } from 'xstream'
import { makePropsDriver } from './propsDriver'
import { _PropsDriver, Component, Dict } from './types'
import { makeWrappedDOMDriver } from './wrappedDOMDriver'

export interface ILifecycle<Props extends Dict = Dict> {
	update: (props: Props) => any
	remove: () => any
}

export class Lifecycle<Props extends Dict = Dict> {
	private elm: HTMLElement & Dict
	private subscriptions: Dict<Subscription> = {}
	private propsDriver: _PropsDriver<Props>

	public constructor(
		elm: HTMLElement,
		main: Component<Props>,
		makeDrivers: (elm: HTMLElement) => Drivers,
		props: {},
	) {
		this.elm = elm
		this.propsDriver = makePropsDriver<Props>(elm, objectKeys(props))

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
					next: detail => {
						this.elm.dispatchEvent(new CustomEvent(key, { detail }))
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
