import { Stream } from 'xstream'

export interface CanvasShape {
  type: 'retangle'
  x: number
  y: number
  width: number
  height: number
  color: string
}

export function makeCanvasDriver() {
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
