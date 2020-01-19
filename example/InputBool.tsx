import Snabbdom from 'snabbdom-pragma'
import { customElementify } from '../src'
import { Stream } from 'xstream'

export interface InputBoolProps {
	value: boolean
	label: string
}

export const InputBool = customElementify<InputBoolProps>(
	function CycleComponent(sources) {
		const { props, DOM } = sources

		const props$ = DOM.select('input')
			.events('input')
			.map(event => ({
				value: (event.target as HTMLInputElement).checked,
			}))

		return {
			props: props$,
			DOM: props.stream.map(({ value = false, label: labelString }) => (
				<root>
					{labelString && <label>{labelString}</label>}
					<input type="checkbox" checked={value} />
				</root>
			)),
		}
	},
	{ props: { value: Boolean, label: String } },
)
