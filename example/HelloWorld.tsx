import Snabbdom from 'snabbdom-pragma'
import { ComponentSources, customElementify } from '../src'

const css = `
h1 {
  color: red;
}
`

export const HelloWorld = customElementify(
	function CycleComponent(sources: ComponentSources) {
		const { props } = sources

		return {
			DOM: props.get('name').map((name: string) => {
				return (
					<root>
						<style>{css}</style>
						<h1>Hello {name}</h1>
					</root>
				)
			}),
		}
	},
	{ props: { name: String }, shadowRootInit: true },
)
