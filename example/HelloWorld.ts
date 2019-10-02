import { h1 } from '@cycle/dom'
import { ComponentSources, customElementify } from '../src'

export const HelloWorld = customElementify(
  function CycleComponent(sources: ComponentSources) {
    const { props } = sources

    return {
      DOM: props
        .get('name')
        .map((name: string) => [h1(`Hello ${name}`), h1(`Hello ${name}`)]),
    }
  },
  { props: { name: String }, shadowRootInit: true },
)
