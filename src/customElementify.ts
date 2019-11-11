import { CycleComponent } from './CycleComponent'
import { Component, CycleComponentOptions, Dict } from './types'

export function customElementify<Props extends Dict = Dict>(
  main: Component,
  options?: CycleComponentOptions,
): typeof Element
export function customElementify<Props extends Dict = Dict>(
  main: Component,
  options: Dict = {},
) {
  let { props = {}, shadowRootInit, drivers = () => ({}) } = options

  if (typeof shadowRootInit !== 'object') {
    shadowRootInit = shadowRootInit ? { mode: 'open' } : undefined
  }

  return class extends CycleComponent<Props> {
    get drivers() {
      return drivers(this)
    }
    public static props = props
    public static shadowRootOptions = shadowRootInit
    public static main = main
  }
}
