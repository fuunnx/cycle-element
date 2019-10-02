import Element from '@skatejs/element/dist/esm'
import { CycleComponent } from './CycleComponent'
import { Component, CycleComponentOptions, Dict } from './types'

export function customElementify(
  main: Component,
  options?: CycleComponentOptions,
): typeof Element

export function customElementify(main: Component, options: Dict = {}) {
  let { props = {}, shadowRootInit, drivers } = options

  if (typeof shadowRootInit !== 'object') {
    shadowRootInit = shadowRootInit ? { mode: 'open' } : undefined
  }

  return class extends CycleComponent {
    public static props = props
    public static shadowRootOptions = shadowRootInit
    public static main = main

    get drivers() {
      return drivers ? drivers(this) : {}
    }
  }
}
