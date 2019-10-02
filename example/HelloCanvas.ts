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
          const w = element.width
          const h = element.height
          return {
            target: element,
            content: [
              {
                type: 'rectangle',
                x: (x / 100) * w,
                y: (y / 100) * h,
                width: (width / 100) * w,
                height: (height / 100) * h,
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
  x: number
  y: number
  width: number
  height: number
  color: string
}
function makeCanvasDriver() {
  return function canvasDriver($instructions: Stream<any>) {
    const sub = $instructions.subscribe({
      next(instructions) {
        const { target } = instructions
        const ctx = target.getContext('2d')
        ctx.clearRect(0, 0, target.width, target.height)

        instructions.content.forEach((content: CanvasShape) => {
          ctx.fillStyle = content.color
          ctx.fillRect(content.x, content.y, content.width, content.height)
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
