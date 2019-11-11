import { Stream } from 'xstream'

export interface Rectangle {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  color: string
}

export interface Lines {
  type: 'lines'
  color: string
  width: number
  lines: Array<[{ x: number; y: number }, { x: number; y: number }]>
}

const renderers = {
  rectangle(ctx: CanvasRenderingContext2D, shape: Rectangle) {
    ctx.fillStyle = shape.color
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
  },

  lines(ctx: CanvasRenderingContext2D, shape: Lines) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.width
    shape.lines.forEach(([from, to]) => {
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
    })
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  },
}

export function makeCanvasDriver() {
  return function canvasDriver($instructions: Stream<any>) {
    const sub = $instructions.subscribe({
      next(instructions) {
        const { target } = instructions
        const ctx = target.getContext('2d')
        ctx.clearRect(0, 0, target.width, target.height)

        instructions.content.forEach((shape: Rectangle | Lines) => {
          renderers[shape.type](ctx, shape as any)
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
