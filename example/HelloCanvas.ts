import { canvas } from '@cycle/dom'
import { props } from '@skatejs/element/dist/esm'
import xs, { Stream } from 'xstream'
import { customElementify } from '../src'

export const HelloCanvas = customElementify(
  function CycleComponent(sources) {
    const { DOM, props: propsSource } = sources

    return {
      DOM: xs.of(canvas()),
      canvas: xs
        .combine(DOM.select('canvas').element(), propsSource.get())
        .map(([element, properties]) => {
          const { color, x, y, width, height } = properties
          return {
            target: element,
            content: [
              {
                type: 'rectangle',
                x1: x,
                x2: x + width,
                y1: y,
                y2: y + height,
                color,
              },
            ],
          }
        }),
    }
  },
  {
    props: {
      color: String,
      x: Number,
      y: Number,
      width: { ...props.number, default: () => 100 },
      height: { ...props.number, default: () => 100 },
    },
    drivers: () => ({
      canvas: makeCanvasDriver(),
    }),
  },
)

interface CanvasShape {
  type: 'retangle'
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}
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
