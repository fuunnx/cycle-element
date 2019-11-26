import { HelloWorld } from './HelloWorld'
window.customElements.define('hello-world', HelloWorld)

import { InputText } from './InputText'
window.customElements.define('input-text', InputText)

import { HelloCanvas } from './HelloCanvas'
window.customElements.define('hello-canvas', HelloCanvas)

import { InputRange } from './InputRange'
window.customElements.define('input-range', InputRange)

import { Tesseract } from './Tesseract'
window.customElements.define('hyper-cube', Tesseract)

import { InputBool } from './InputBool'
window.customElements.define('input-bool', InputBool)

const colorInput = document.querySelector('[name="color"]') as any
const colorReversedInput = document.querySelector(
	'[name="color_reversed"]',
) as any
const canvasElement = document.querySelector('hello-canvas') as any
const hypercube = document.querySelector('hyper-cube') as any
const helloElement = document.querySelector('hello-world') as any
const xRange = document.querySelector('[name="xRange"]') as any
const yRange = document.querySelector('[name="yRange"]') as any
const widthRange = document.querySelector('[name="widthRange"]') as any
const heightRange = document.querySelector('[name="heightRange"]') as any

// const color$ = colorInput.value$.map((val: string) => {
//   if (val === "red") {
//     return 'NOPE IT\'s blue';
//   }
//   return val;
// });

// colorReversedInput.value$ = color$.map(reverse);
// colorInput.value$ = colorReversedInput.value$.map(reverse);
// helloElement.name$ = color$;

// function reverse(str: string) {
//   return str
//     .split("")
//     .reverse()
//     .join("");
// }

// Object.assign(canvasElement, {
//   color$: colorInput.value$.map((x: string) => x.split(" ").reverse()[0] || ""),
//   x$: xRange.value$,
//   y$: yRange.value$,
//   width$: widthRange.value$,
//   height$: heightRange.value$
// });

knob('rotateX', 2 * Math.PI)
knob('rotateY', 2 * Math.PI)
knob('rotateZ', 2 * Math.PI)
knob('rotateW', 2 * Math.PI)
knob('perspectiveW', 1)
knob('perspectiveZ', 1)
toggle('skew')

function knob(name: string, max: number) {
	let aside = document.querySelector('aside')
	if (aside) {
		let knob: any = document.createElement('input-range')
		knob.label = name
		knob.max = max
		knob.value = max / 2
		aside.appendChild(knob)

		hypercube[name + '$'] = knob.value$
	}
}

function toggle(name: string) {
	let aside = document.querySelector('aside')
	if (aside) {
		let knob: any = document.createElement('input-bool')
		knob.label = name
		aside.appendChild(knob)

		hypercube[name + '$'] = knob.value$
	}
}
