import Snabbdom from 'snabbdom-pragma'
import { customElementify } from '../src'

export const InputText = customElementify(
	function CycleComponent(sources) {
		const { props, DOM } = sources

		const props$ = DOM.select('input')
			.events('input')
			.map(event => ({
				value: (event.target as HTMLInputElement).value,
			}))

		const focus$ = DOM.select('input').events('focus')

		return {
			focus$,
			props: props$,
			DOM: props.get().map(props => {
				const { value, label } = props
				return (
					<root>
						{label && <label>{label}</label>}
						<input type="text" value={value} />
					</root>
				)
			}),
		}
	},
	{ props: { value: String, label: String } },
)
