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

const colorInput = document.querySelector('[name="color"]') as any
const colorReversedInput = document.querySelector(
  '[name="color_reversed"]',
) as any
const canvasElement = document.querySelector('hello-canvas') as any
const helloElement = document.querySelector('hello-world') as any
const xRange = document.querySelector('[name="xRange"]') as any
const yRange = document.querySelector('[name="yRange"]') as any
const widthRange = document.querySelector('[name="widthRange"]') as any
const heightRange = document.querySelector('[name="heightRange"]') as any

const color$ = colorInput.value$.map((val: string) => {
  if (val === 'red') {
    return 'NOPE IT\'s blue'
  }
  return val
})

colorReversedInput.value$ = color$.map(reverse)
colorInput.value$ = colorReversedInput.value$.map(reverse)
helloElement.name$ = color$

function reverse(str: string) {
  return str
    .split('')
    .reverse()
    .join('')
}

Object.assign(canvasElement, {
  color$: colorInput.value$.map((x: string) => x.split(' ').reverse()[0] || ''),
  x$: xRange.value$,
  y$: yRange.value$,
  width$: widthRange.value$,
  height$: heightRange.value$,
})
