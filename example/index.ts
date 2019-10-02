import { HelloWorld } from './HelloWorld'
window.customElements.define('hello-world', HelloWorld)

import { InputText } from './InputText'
window.customElements.define('input-text', InputText)

import xs from 'xstream'
import { HelloCanvas } from './HelloCanvas'
window.customElements.define('hello-canvas', HelloCanvas)

const inputElement = document.querySelector('input-text') as any
const canvasElement = document.querySelector('hello-canvas') as any
const helloElement = document.querySelector('hello-world') as any

inputElement.value$ = inputElement.value$.map((val: string) => {
  if (val === 'red') {
    return 'blue'
  }
  return val
})

helloElement.name$ = inputElement.value$.map((x: string) =>
  x
    .split('')
    .reverse()
    .join(''),
)
canvasElement.color$ = inputElement.value$
