import { DOMSource } from '@cycle/dom'
import { Driver, Drivers } from '@cycle/run'
import { Props } from '@skatejs/element/dist/esm'
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

export interface ComponentSources {
  DOM: DOMSource
  props: PropsSource
}

export type PropsDriver = Driver<Stream<Dict<any>>, PropsSource>
export type _PropsDriver = PropsDriver & {
  next: (x: Dict<any>) => void
}

export type Component = (
  sources: ComponentSources & Dict,
) => ComponentSinks & StreamDict

export interface PropsSource {
  get: {
    (propName: string): Stream<any>
    (): Stream<Props>
  }
  dispose: () => void
}
