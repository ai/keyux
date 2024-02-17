import { type DOMWindow, JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { jumpKeyUX, startKeyUX } from '../index.js'

function click(
  window: DOMWindow,
  element: Element,
  extra: Partial<MouseEventInit> = {}
): void {
  element.dispatchEvent(
    new window.MouseEvent('click', {
      bubbles: true,
      clientX: 0,
      clientY: 0,
      ...extra
    })
  )
}

function press(window: DOMWindow, key: string): void {
  let down = new window.KeyboardEvent('keydown', { bubbles: true, key })
  window.document.activeElement!.dispatchEvent(down)
  let up = new window.KeyboardEvent('keyup', { bubbles: true, key })
  window.document.activeElement!.dispatchEvent(up)
}

test('jumps to next area by click and back by escape', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button aria-controls="step3"></button></div>' +
    '<div id="step3"><label tabindex="0" aria-controls="step4">' +
    '</label><a href="#"></a></div>' +
    '<div id="step4"><input type="text" aria-controls="step5" /></div>' +
    '<div id="step5"><a href="#"></a></div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2button = window.document.querySelector('#step2 button')!
  let step3label = window.document.querySelector('#step3 label')!
  let step4input = window.document.querySelector('#step4 input')!
  let step5link = window.document.querySelector('#step5 a')!

  step1.focus()
  click(window, step1)
  equal(window.document.activeElement, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step2button)

  click(window, step2button)
  await setTimeout(10)
  equal(window.document.activeElement, step3label)

  click(window, step3label)
  await setTimeout(10)
  equal(window.document.activeElement, step4input)

  press(window, 'Enter')
  await setTimeout(10)
  equal(window.document.activeElement, step5link)

  press(window, 'Escape')
  equal(window.document.activeElement, step4input)

  press(window, 'Escape')
  equal(window.document.activeElement, step3label)

  press(window, 'Escape')
  equal(window.document.activeElement, step2button)

  press(window, 'Escape')
  equal(window.document.activeElement, step1)

  press(window, 'Escape')
  equal(window.document.activeElement, step1)
})

test('stops event tracking', async () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button></button></div>'

  let step1 = window.document.querySelector('#step1')!
  stop()

  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, window.document.body)
})

test('ignores mouse click', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><button></button></div>'

  let step1 = window.document.querySelector('#step1')!
  let step2button = window.document.querySelector('#step2 button')!

  click(window, step1, { clientX: 0, clientY: 10 })
  await setTimeout(10)
  equal(window.document.activeElement, window.document.body)

  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step2button)
})

test('ignores links without data attribute', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])
  window.document.body.innerHTML =
    '<a id="step1" href="#"></a>' + '<div id="step2"><button></button></div>'

  click(window, window.document.querySelector('#step1')!)
  await setTimeout(10)
  equal(window.document.activeElement, window.document.body)
})

test('is ready for missed next area', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX()])

  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>'
  click(window, window.document.querySelector('#step1')!)
  await setTimeout(10)
  equal(window.document.activeElement, window.document.body)

  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"></div>'
  click(window, window.document.querySelector('#step1')!)
  await setTimeout(10)
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
  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step2link)

  click(window, step2link)
  await setTimeout(10)
  equal(window.document.activeElement, step3link)

  step2link.remove()
  await setTimeout(10)
  press(window, 'Escape')
  equal(window.document.activeElement, step1)
})

test('allows to change interactive selector', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX('button')])
  window.document.body.innerHTML =
    '<a id="step1" href="#" aria-controls="step2"></a>' +
    '<div id="step2"><a></a><button></button></div>'

  click(window, window.document.querySelector('#step1')!)
  await setTimeout(10)
  equal(
    window.document.activeElement,
    window.document.querySelector('#step2 button')!
  )
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

  click(window, window.document.querySelector('#step1')!)
  await setTimeout(10)
  equal(jumped, 1)
})
