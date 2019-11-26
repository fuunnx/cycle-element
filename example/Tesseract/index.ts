import { canvas } from '@cycle/dom'
import xs from 'xstream'
import { customElementify } from '../../src'
import { makeCanvasDriver } from '../HelloCanvas/canvasDriver'

import { map } from 'ramda'
import { hypercubeState } from './hypercube'
import { Point } from './Shape'
import { props } from '@skatejs/element/dist/esm'

const WIDTH = 800

export interface Props {
	rotateX: number
	rotateY: number
	rotateZ: number
	rotateW: number
	perspectiveZ: number
	perspectiveW: number
	skew: boolean
}

export const Tesseract = customElementify<Props>(
	function CycleComponent(sources) {
		const { DOM, props: propsSource } = sources

		return {
			DOM: xs.of(canvas({ attrs: { width: WIDTH, height: WIDTH } })),
			canvas: xs
				.combine(DOM.select('canvas').element(), propsSource.get())
				.map(([element, props]) => {
					const lines = hypercubeState(props as Props).lines.map(line => {
						const coeff = (line as any)[0][2] + (line as any)[1][2]

						return {
							type: 'lines',
							width: coeff * 2 <= 2 ? 3 : coeff * 2,
							color: 'black',
							cap: 'round',
							dashSize: coeff * 2 <= 2 ? 3 : 0,
							lines: [
								line.map((point: Point) => {
									const [x = 1, y = 1] = point
									return {
										x: (x + 0.5) * (WIDTH - 200) + 100,
										y: (y + 0.5) * (WIDTH - 200) + 100,
									}
								}),
							],
						}
					})

					return {
						target: element,
						content: lines,
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
			perspectiveW: { ...props.number, default: () => 0.5 },
			perspectiveZ: { ...props.number, default: () => 0.5 },
			skew: Boolean,
		},

		drivers: () => ({
			canvas: makeCanvasDriver(),
		}),
	},
)
