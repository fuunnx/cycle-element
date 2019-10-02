import { DOMSource } from '@cycle/dom'
import { Drivers } from '@cycle/run'
import { Props } from '@skatejs/element/dist/esm'
import { Stream } from 'xstream'

export interface Dict<T = any> {
  [opt: string]: T
}

export type StreamDict = Dict<Stream<any>>

export interface CycleComponentOptions {
  props?: Props
  drivers?: (element: HTMLElement) => Drivers
  shadowRootInit?: ShadowRootInit | boolean
}

export interface ComponentSinks {
  DOM?: Stream<any>
}

export interface ComponentSources {
  DOM: DOMSource
  props: PropsSource
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
