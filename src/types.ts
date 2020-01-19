import { MainDOMSource } from '@cycle/dom'
import { Driver } from '@cycle/run'
import { Stream } from 'xstream'
import { PropType } from '@skatejs/element/dist/esm/types'

export interface Dict<T = any> {
	[opt: string]: T
}

export type StreamDict = Dict<Stream<any>>

export type SkatePropTypes<Props extends Dict = Dict> = {
	[P in keyof Props]: PropType
}

export type Props = Dict<any>

export interface ComponentSinks<Props extends Dict = Dict> {
	DOM?: Stream<any>
	props?: Stream<any>
}

export interface ComponentSources<Props extends Dict = Dict> {
	DOM: MainDOMSource
	props: PropsSource<Props>
}

export type PropsDriver<Props extends Dict = Dict> = Driver<
	Stream<Props>,
	PropsSource
>
export type _PropsDriver<Props extends Dict = Dict> = PropsDriver<Props> & {
	next: (x: Props) => void
}

export type Component<Props extends Dict = Dict> = (
	sources: ComponentSources<Props> & Dict,
) => ComponentSinks<Props> & StreamDict

export interface PropsSource<Props extends Dict = Dict> {
	stream: Stream<Props>
	prop: (propName: keyof Props) => Stream<any>
}
