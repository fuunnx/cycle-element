import { HelloWorld } from './HelloWorld'
window.customElements.define('hello-world', HelloWorld)

import { InputText } from './InputText'
window.customElements.define('input-text', InputText)

import { HelloCanvas } from './HelloCanvas'
window.customElements.define('hello-canvas', HelloCanvas)

import { InputRange } from './InputRange'
window.customElements.define('input-range', InputRange)

const inputElement = document.querySelector('input-text') as any
const canvasElement = document.querySelector('hello-canvas') as any
const helloElement = document.querySelector('hello-world') as any
const xRange = document.querySelector('[name="xRange"]') as any
const yRange = document.querySelector('[name="yRange"]') as any
const widthRange = document.querySelector('[name="widthRange"]') as any
const heightRange = document.querySelector('[name="heightRange"]') as any

inputElement.value$ = inputElement.value$.map((val: string) => {
  if (val === 'red') {
    return 'NOPE IT\'s blue'
  }
  return val
})

helloElement.name$ = inputElement.value$.map((x: string) =>
  x
    .split('')
    .reverse()
    .join(''),
)

canvasElement.color$ = inputElement.value$.map(
  (x: string) => x.split(' ').reverse()[0] || '',
)
canvasElement.x$ = xRange.value$
canvasElement.y$ = yRange.value$
canvasElement.width$ = widthRange.value$
canvasElement.height$ = heightRange.value$
