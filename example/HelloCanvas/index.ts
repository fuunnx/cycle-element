import { canvas } from '@cycle/dom'
import { props } from '@skatejs/element/dist/esm'
import xs from 'xstream'
import { customElementify } from '../../src'
import { makeCanvasDriver } from './canvasDriver'

interface HelloCanvasProps {
	color: string
	x: number
	y: number
	width: number
	height: number
}

export const HelloCanvas = customElementify<HelloCanvasProps>(
	function CycleComponent(sources) {
		const { DOM, props: propsSource } = sources

		return {
			DOM: xs.of(canvas()),
			canvas: xs
				.combine(DOM.select('canvas').element(), propsSource.stream)
				.map(([element, properties]) => {
					const { color, x, y, width, height } = properties
					const w = (element as any).width
					const h = (element as any).height
					return {
						target: element,
						content: [
							{
								type: 'rectangle',
								x: (Math.min(100 - width, x) / 100) * w,
								y: (Math.min(100 - height, y) / 100) * h,
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
			width: { ...props.number, default: () => 50 },
			height: { ...props.number, default: () => 50 },
		},
		drivers: () => ({
			canvas: makeCanvasDriver(),
		}),
	},
)
