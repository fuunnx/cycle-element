import { canvas, DOMSource, h1, input } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { customElementify, RequiredSources } from '../src'

window.customElements.define(
  'hello-world',
  customElementify(
    function CycleComponent(sources: RequiredSources) {
      const { props } = sources

      return {
        DOM: props.get('name').map((name: string) => h1(`Hello ${name}`)),
      }
    },
    { props: { name: String } },
  ),
)

window.customElements.define(
  'input-text',
  customElementify(
    function CycleComponent(sources: RequiredSources) {
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
        DOM: props
          .get('value')
          .debug('value')
          .map((value: string) => input({ props: { value, type: 'text' } })),
      }
    },
    { props: { value: String, lol: Boolean } },
  ),
)

interface CanvasShape {
  type: 'retangle'
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

window.customElements.define(
  'hello-canvas',
  customElementify(
    function CycleComponent(sources: RequiredSources) {
      const { DOM, props } = sources

      return {
        DOM: xs.of(canvas()),
        canvas: xs
          .combine(DOM.select('canvas').element(), props.get('color'))
          .map(([element, color]) => ({
            target: element,
            content: [
              { type: 'rectangle', x1: 10, x2: 100, y1: 10, y2: 100, color },
            ],
          })),
      }
    },
    {
      props: { color: String },
      drivers: () => ({
        canvas: makeCanvasDriver(),
      }),
    },
  ),
)

function makeCanvasDriver() {
  return function canvasDriver($instructions: Stream<any>) {
    const sub = $instructions.subscribe({
      next(instructions) {
        const ctx = instructions.target.getContext('2d')
        instructions.content.forEach((content: CanvasShape) => {
          ctx.fillStyle = content.color
          ctx.fillRect(content.x1, content.y1, content.x2, content.y2)
        })
      },
    })

    return {
      dispose() {
        sub.unsubscribe()
      },
    }
  }
}
