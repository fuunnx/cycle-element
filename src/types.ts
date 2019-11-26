import { DOMSource } from '@cycle/dom'
import { Driver, Drivers } from '@cycle/run'
import { Stream } from 'xstream'

export interface Dict<T = any> {
	[opt: string]: T
}

export type StreamDict = Dict<Stream<any>>

export interface ComponentOptions {
	props?: Props
	drivers?: (element: HTMLElement) => Drivers
}

export interface CycleComponentOptions {
	props?: Props
	drivers?: (element: HTMLElement) => Drivers
	shadowRootInit?: ShadowRootInit | boolean
}

export type Props = Dict<any>

export interface ComponentSinks {
	DOM?: Stream<any>
}

export interface ComponentSources<Props extends Dict = Dict> {
	DOM: DOMSource
	props: PropsSource<Props>
}

export type PropsDriver<Props extends Dict = Dict> = Driver<
	Stream<Props>,
	PropsSource
>
export type _PropsDriver<Props extends Dict = Dict> = PropsDriver<Props> & {
	next: (x: Props) => void
}

export type Component = (
	sources: ComponentSources & Dict,
) => ComponentSinks & StreamDict

export interface PropsSource<Props extends Dict = Dict> {
	get: {
		(propName: keyof Props): Stream<any>
		(): Stream<Props>
	}
	dispose: () => void
}
