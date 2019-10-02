import { CycleComponent } from './CycleComponent'
import { Component, CycleComponentOptions, Dict } from './types'

export function customElementify(
  main: Component,
  options?: CycleComponentOptions,
): typeof Element
export function customElementify(main: Component, options: Dict = {}) {
  const props = options.props || {}
  let shadowRootOptions = options.shadowRootInit
  if (typeof shadowRootOptions !== 'object') {
    shadowRootOptions = shadowRootOptions ? { mode: 'open' } : undefined
  }

  const extraDrivers = options.drivers || (() => ({}))

  return class extends CycleComponent {
    get drivers() {
      return {
        ...extraDrivers(this),
      }
    }
    public static props = props
    public static shadowRootOptions = shadowRootOptions
    public static main = main
  }
}
