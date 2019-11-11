import { canvas } from '@cycle/dom'
import xs from 'xstream'
import { customElementify } from '../../src'
import { makeCanvasDriver } from '../HelloCanvas/canvasDriver'

import { map } from 'ramda'
import { hypercubeState } from './hypercube'
import { Point } from './Shape'

const WIDTH = 500

export interface Props {
  rotateX: number
  rotateY: number
  rotateZ: number
  rotateW: number
  perspectiveZ: number
  perspectiveW: number
}

export const Tesseract = customElementify<Props>(
  function CycleComponent(sources) {
    const { DOM, props: propsSource } = sources

    return {
      DOM: xs.of(canvas({ attrs: { width: 800, height: 800 } })),
      canvas: xs
        .combine(DOM.select('canvas').element(), propsSource.get())
        .map(([element, props]) => {
          const lines = hypercubeState(props as Props).lines.map(
            map((point: Point) => {
              const [x = 1, y = 1] = point
              return {
                x: (x + 0.5) * WIDTH,
                y: (y + 0.5) * WIDTH,
              }
            }),
          )

          return {
            target: element,
            content: [
              {
                type: 'lines',
                width: 2,
                color: 'black',
                lines,
              },
            ],
          }
        }),
    }
  },
  {
    props: {
      rotateX: Number,
      rotateY: Number,
      rotateZ: Number,
      rotateW: Number,
      perspectiveW: Number,
      perspectiveZ: Number,
    },

    drivers: () => ({
      canvas: makeCanvasDriver(),
    }),
  },
)
