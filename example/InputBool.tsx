import Snabbdom from 'snabbdom-pragma'
import { Stream } from 'xstream'
import { customElementify } from '../src'

export const InputBool = customElementify(
	function CycleComponent(sources) {
		const { props, DOM } = sources

		const $input = DOM.select('input')
		const events = (DOM.select('input').events as (
			eName: string,
		) => Stream<Event>).bind($input)

		const props$ = events('input').map(event => ({
			value: (event.target as HTMLInputElement).checked,
		}))

		return {
			props: props$,
			DOM: props.get().map(({ value = false, label: labelString }) => (
				<root>
					{labelString && <label>{labelString}</label>}
					<input type="checkbox" checked={value} />
				</root>
			)),
		}
	},
	{ props: { value: Boolean, label: String } },
)
