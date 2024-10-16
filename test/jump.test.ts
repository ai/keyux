import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { jumpKeyUX, startKeyUX } from '../index.js'
import { keyboardClick, mouseClick, press } from './utils.js'

test('jumps to next area by click and back by escape', async () => {
  const { window } = new JSDOM()
  global.document = window.document

  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button aria-controls="step3"></button></div>' +
    '<div id="step3"><label tabindex="0" aria-controls="step4">' +
    '</label><a href="#"></a></div>' +
    '<div id="step4"><input type="text" aria-controls="step5" /></div>' +
    '<div id="step5"><input type="radio" name="a" value="1">' +
    ' <input type="radio" name="a" value="2" checked></div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2button = window.document.querySelector('#step2 button')!
  let step3label = window.document.querySelector('#step3 label')!
  let step4input = window.document.querySelector('#step4 input')!
  let step5checked = window.document.querySelector('#step5 input:last-child')!

  step1.focus()
  keyboardClick(window, step1)

  equal(window.document.activeElement, step1)
  await setTimeout(50)
  equal(window.document.activeElement, step2button)

  keyboardClick(window, step2button)
  await setTimeout(50)
  equal(window.document.activeElement, step3label)

  keyboardClick(window, step3label)
  await setTimeout(50)
  equal(window.document.activeElement, step4input)

  press(window, 'Enter')
  await setTimeout(50)
  equal(window.document.activeElement, step5checked)

  press(window, 'Escape')
  equal(window.document.activeElement, step4input)

  press(window, 'Escape')
  equal(window.document.activeElement, step3label)

  press(window, 'Escape')
  equal(window.document.activeElement, step2button)

  press(window, 'Escape')
  equal(window.document.activeElement, step1)

  press(window, 'Escape')
  equal(window.document.activeElement, window.document.body)
})

test('stops event tracking', async () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button></button></div>'

  let step1 = window.document.querySelector('#step1')!
  stop()
})

test('ignores mouse click', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button></button></div>'

  let step1 = window.document.querySelector('#step1')!
  let step2button = window.document.querySelector('#step2 button')!

  mouseClick(window, step1)
  await setTimeout(50)
  equal(window.document.activeElement, window.document.body)

  keyboardClick(window, step1)
  await setTimeout(50)
  equal(window.document.activeElement, step2button)
})

test('ignores links without data attribute', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#"></a>' + '<div id="step2"><button></button></div>'

  keyboardClick(window, window.document.querySelector('#step1')!)
  await setTimeout(50)
  equal(window.document.activeElement, window.document.body)
})

test('is ready for missed next area', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])

  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>'
  keyboardClick(window, window.document.querySelector('#step1')!)
  await setTimeout(50)
  equal(window.document.activeElement, window.document.body)

  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"></div>'
  keyboardClick(window, window.document.querySelector('#step1')!)
  await setTimeout(50)
  equal(window.document.activeElement, window.document.body)
})

test('is ready for missed previous area', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2">1</a>' +
    '<div id="step2"><a href="#" aria-controls="step3">2</a></div>' +
    '<div id="step3"><a href="#">3</a></div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2link = window.document.querySelector('#step2 a')!
  let step3link = window.document.querySelector('#step3 a')!

  step1.focus()
  keyboardClick(window, step1)
  await setTimeout(50)
  equal(window.document.activeElement, step2link)

  keyboardClick(window, step2link)
  await setTimeout(50)
  equal(window.document.activeElement, step3link)

  step2link.remove()
  await setTimeout(50)
  press(window, 'Escape')
  equal(window.document.activeElement, step1)
})

test('fires event on jump', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button></button></div>'

  let jumped = 0
  window.document.body.addEventListener('keyuxJump', e => {
    let el = e.target as HTMLElement
    equal(el.id, 'step2')
    jumped += 1
  })

  keyboardClick(window, window.document.querySelector('#step1')!)
  await setTimeout(50)
  equal(jumped, 1)
})
