import Snabbdom from 'snabbdom-pragma'
import { customElementify } from '../src'

const css = `
h1 {
  color: red;
}
`

export interface HelloWorldProps {
	name: string
}

export const HelloWorld = customElementify<HelloWorldProps>(
	function CycleComponent(sources) {
		const { props } = sources

		return {
			DOM: props.prop('name').map((name: string) => {
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
