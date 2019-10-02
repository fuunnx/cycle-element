import { h, input, label } from '@cycle/dom'
import { Stream } from 'xstream'
import { customElementify } from '../src'

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
      DOM: propsSource.get().map(({ value, label: labelText, orient }) => {
        const isVertical = orient === 'vertical'
        return h(
          'root',
          {
            style: {
              display: 'flex',
              'flex-direction': isVertical ? 'column' : 'row',
              'justify-content': 'flex-start',
              'max-width': '100px',
            },
          },
          [
            labelText && label(labelText),
            input({
              style: {
                transform: `rotate(${isVertical ? 90 : 0}deg)`,
                position: isVertical ? 'absolute' : 'static',
              },
              props: { value, type: 'range' },
            }),
          ],
        )
      }),
    }
  },
  { props: { value: Number, label: String, orient: String } },
)
