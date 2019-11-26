# Cycle Element -ify

A simple way to package your Cycle.js app and use it anywhere on the web :

- Inside another cycle app
- Inside another framework, you name it

Thanks to an out of the box `custom-element v2` and `snabbdom hooks` support

## Usage

Install the package

`npm install --save cycle-element`

`pnpm install --save cycle-element`

`yarn add cycle-element`

### Basic usage

```javascript
import Snabbdom from 'snabbdom-pragma'
import { customElementify, snabbdomElementify } from 'cycle-element'

function CycleComponent(sources: ComponentSources) {
	const { props } = sources

	return {
		DOM: props.get('name').map((name: string) => {
			return (
				<root>
					<h1>Hello {name}</h1>
				</root>
			)
		}),
	}
}

const helloWorld1 = define('hello-world', customElementify(CycleComponent, {
	props: { name: String },
}))

const helloWorld2 = snabbdomElementify(CycleComponent, {
	props: { name: String },
})

function main() {
	return {
		DOM: xs.of(
			<root>
				<hello-world name="custom element" />
				<helloWorld1 name="custom element (with snabbdom utility function)" />
				<helloWorld2 name="snabbdom hooks" />
			</root>,
		),
	}
}
```

### Advanced usage

```javascript
import Snabbdom from 'snabbdom-pragma'
import { customElementify } from '../src'

// the lofic is exactly the same for snabbdomElementify :

const InputText = define(
    'input-text',
    customElementify(
        function CycleComponent(sources) {
            const { props, DOM } = sources

            const props$ = DOM.select('input')
                .events('input')
                .map(event => ({
                    value: (event.target as HTMLInputElement).value,
                }))

            const focus$ = DOM.select('input').events('focus')

            return {
                focus$, // any sink that does not have a matching driver will be available on the instance
                props: props$, // props will be available as stream and as value on the instance
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
)


function main(sources) {
    const { DOM } = sources

    const inputText$ = DOM.select('input-text').element()

    const value$ = inputText$
    	.map(input => input.value$)
    	.flatten()
    	.startWith('')

    return {
        DOM: xs.combine(value$, focus$)
            .map(([value, focus]) => {
                return (
				    <root>
                        <input-text label="Type here" value={value} /><br />
                 		You typed : {value}<br />
                    </root>
                )
            })
    }
}

```

## About

This library uses skatejs as a foundation

## API

## Advanced usages

## Contributing

## TODO

- Pull request to @cycle/dom allow the use of <root> like in skatejs snabbdom-element : https://github.com/skatejs/skatejs/blob/master/packages/element-snabbdom/src/index.ts
