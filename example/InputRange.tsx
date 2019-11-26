import Snabbdom from 'snabbdom-pragma'
import { Stream } from 'xstream'
import { customElementify } from '../src'
import { props } from '@skatejs/element'

export const InputRange = customElementify(
	function CycleComponent(sources) {
		const { props: propsSource, DOM } = sources

		const $input = DOM.select('input')
		const events = (DOM.select('input').events as (
			eName: string,
		) => Stream<Event>).bind($input)

		const props$ = events('input').map(event => ({
			value: parseFloat((event.target as HTMLInputElement).value) || 0,
		}))

		const focus$ = events('focus')

		return {
			focus$,
			props: props$,
			DOM: propsSource.get().map(({ value, label: labelText, min, max }) => {
				return (
					<root
						style={{
							display: 'flex',
							'flex-direction': 'column',
							'justify-content': 'flex-start',
						}}
					>
						{labelText && <label>{labelText}</label>}
						<input
							value={value}
							type="range"
							min={min}
							max={max}
							step={(max - min) / 100}
						/>
					</root>
				)
			}),
		}
	},
	{
		props: {
			value: Number,
			label: String,
			min: { ...props.number, default: () => 0 },
			max: { ...props.number, default: () => 100 },
		},
	},
)
