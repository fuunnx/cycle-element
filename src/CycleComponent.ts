import Element, { Props } from '@skatejs/element/dist/esm'
import { Lifecycle } from './lifecycle'
import { Component } from './types'

export class CycleComponent extends Element {
  get drivers() {
    return {}
  }
  public static props = {}
  public static shadowRootOptions = undefined
  public static main: Component = () => ({})
  public lifecycle!: Lifecycle

  public connectedCallback() {
    super.connectedCallback()
    const main = (this.constructor as any).main
    this.lifecycle = new Lifecycle(
      this,
      main,
      () => this.drivers,
      (this.constructor as any).props,
    )
  }

  public updated(oldProps: Props) {
    super.updated(oldProps)
    this.lifecycle.update(oldProps)
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.lifecycle.remove()
  }

  public renderer() {
    // do nothing
  }
}
