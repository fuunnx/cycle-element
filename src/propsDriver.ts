import { timeDriver } from '@cycle/time'
import xs, { MemoryStream, Stream, Listener } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { _PropsDriver, Dict, PropsSource } from './types'

const Time = timeDriver(xs.empty())

export function makePropsDriver<Props extends Dict = Dict>(
	elm: HTMLElement,
	propsList: (keyof Props)[],
) {
	const propsNames = new Set(propsList)
	const $element = elm as HTMLElement & Props

	let propsSourcesListener: Listener<Partial<Props>>

	const initialProps = getAllProps<Props>(propsList, $element)
	const props$ = xs
		.createWithMemory<Partial<Props>>({
			start(listener) {
				propsSourcesListener = listener
				listener.next(getAllProps(propsList, $element))
			},
			stop() {
				//
			},
		})
		.fold((acc, x): Props => ({ ...acc, ...x }), initialProps)

	const propsSource = {
		stream: props$,
		prop<K extends keyof Props>(propName: K): MemoryStream<Props[K]> {
			return props$
				.filter(currProps => propName in currProps)
				.map(currProps => currProps[propName])
				.startWith(($element as any)[propName])
				.compose(dropRepeats())
				.remember()
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
						propsSource.prop(key),
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

	function driver(
		propsSink$: Stream<Partial<Props>> = xs.never(),
	): PropsSource<Props> & { dispose: () => void } {
		const subscription = propsSink$.subscribe({
			next: (newProps: Partial<Props>) => {
				Object.entries(newProps).forEach(([key, value]: [keyof Props, any]) => {
					if (propsNames.has('key')) {
						$element[key] = value
					}
				})
			},
			error: (error: Error | string) => {
				throw error
			},
		})

		return {
			...propsSource,
			dispose() {
				subscription.unsubscribe()
			},
		}
	}

	return {
		driver,
		next(nextProps: Partial<Props>) {
			const newProps = getAllProps(
				Object.keys(nextProps) as (keyof Props)[],
				$element,
			)
			propsSourcesListener.next(newProps)
		},
	}
}

function getAllProps<Props extends Dict = Dict>(
	propsNames: (keyof Props)[],
	$element: Props,
): Props {
	return propsNames.reduce((acc, propName) => {
		acc[propName] = $element[propName]
		return acc
	}, {} as Props)
}
