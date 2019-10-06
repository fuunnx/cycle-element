import Snabbdom from 'snabbdom-pragma'
import { Stream } from 'xstream'
import { customElementify } from '../src'

export const InputText = customElementify(
  function CycleComponent(sources) {
    const { props, DOM } = sources

    const $input = DOM.select('input')
    const events = (DOM.select('input').events as (
      eName: string,
    ) => Stream<Event>).bind($input)

    const props$ = events('input').map(event => ({
      value: (event.target as HTMLInputElement).value,
    }))

    const focus$ = events('focus')

    return {
      focus$,
      props: props$,
      DOM: props.get().map(({ value = '', label: labelString }) => (
        <root class={{ valid: value.length > 0 }}>
          {labelString && <label>{labelString}</label>}
          <input type="text" value={value} />
        </root>
      )),
    }
  },
  { props: { value: String, label: String } },
)
