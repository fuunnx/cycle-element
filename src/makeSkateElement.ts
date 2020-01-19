import Element from '@skatejs/element'
import { Dict, SkatePropTypes } from './types'
import { ILifecycle } from './lifecycle'

export interface makeSkateElementOptions<Props> {
	props?: SkatePropTypes<Props>
	shadowRootInit?: ShadowRootInit | boolean
}

export class SkateElement<Props> extends Element {
	lifecycle: ILifecycle<Props>
}

export function makeSkateElement<Props extends Dict = Dict>(
	makeLifeCycle: (elm: HTMLElement) => ILifecycle<Props>,
	options?: makeSkateElementOptions<Props>,
) {
	const { shadowRootInit, props = {} } = options

	return class extends SkateElement<Props> {
		public static props: SkatePropTypes<Props> = props as SkatePropTypes<Props>
		public static shadowRootOptions =
			// prettier-ignore
			shadowRootInit === false ? undefined
				: shadowRootInit === true ? ({ mode: 'open' }) as ShadowRootInit
        : shadowRootInit

		public lifecycle!: ILifecycle<Props>

		public connectedCallback() {
			super.connectedCallback()
			this.lifecycle = makeLifeCycle(this)
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
	} as typeof SkateElement
}
