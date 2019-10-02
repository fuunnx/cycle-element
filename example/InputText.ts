import { h, input } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { customElementify } from '../src'

export const InputText = customElementify(
  function CycleComponent(sources) {
    const { props, DOM } = sources

    const $input = DOM.select('input')
    const events = (DOM.select('input').events as (
      eName: string,
    ) => Stream<Event>).bind($input)

    const props$ = events('input')
      .map(event => ({
        value: (event.target as HTMLInputElement).value,
      }))
      .debug('set props')

    const focus$ = events('focus')

    return {
      focus$,
      props: props$,
      DOM: props
        .get()
        .map(({ value = '' }) =>
          h('root', { class: { valid: value.length >= 3 } }, [
            input({ props: { value, type: 'text' } }),
          ]),
        ),
    }
  },
  { props: { value: String } },
)
