import { type DOMWindow, JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { hiddenKeyUX, jumpKeyUX, startKeyUX } from '../index.js'

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

test('supports nested hidden menus', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX(), hiddenKeyUX()])

  window.document.body.innerHTML =
    '<button id="step1" aria-controls="step2"></button>' +
    '<div id="step2" aria-hidden="true" hidden><a href="#"></a></div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2 = window.document.querySelector<HTMLElement>('#step2')!
  step1.focus()

  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step2.querySelector('a')!)
  equal(step2.getAttribute('aria-hidden'), 'false')
  equal(step2.hidden, false)

  press(window, 'Escape')
  await setTimeout(10)
  equal(window.document.activeElement, step1)
  equal(step2.getAttribute('aria-hidden'), 'true')
  equal(step2.hidden, true)
})

test('works with visible menus too', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [jumpKeyUX(), hiddenKeyUX()])

  window.document.body.innerHTML =
    '<button id="step1" aria-controls="step2"></button>' +
    '<div id="step2" aria-hidden="true">' +
    '<a href="#" tabindex="-1"></a><a href="#" tabindex="-1"></a>' +
    '</div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2 = window.document.querySelector<HTMLElement>('#step2')!
  let step2a = step2.querySelector<HTMLElement>('a:first-child')!
  let step2b = step2.querySelector<HTMLElement>('a:last-child')!
  step1.focus()

  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step2a)
  equal(step2.getAttribute('aria-hidden'), 'false')
  equal(step2a.tabIndex, 0)
  equal(step2b.tabIndex, -1)

  press(window, 'Escape')
  await setTimeout(10)
  equal(window.document.activeElement, step1)
  equal(step2.getAttribute('aria-hidden'), 'true')
  equal(step2.hidden, false)
  equal(step2a.tabIndex, -1)
  equal(step2b.tabIndex, -1)
})

test('stops event tracking', async () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [jumpKeyUX(), hiddenKeyUX()])

  window.document.body.innerHTML =
    '<button id="step1" aria-controls="step2"></button>' +
    '<div id="step2" aria-hidden="true" hidden><a href="#"></a></div>'

  let step1 = window.document.querySelector<HTMLElement>('#step1')!
  let step2 = window.document.querySelector<HTMLElement>('#step2')!
  step1.focus()

  stop()
  click(window, step1)
  await setTimeout(10)
  equal(window.document.activeElement, step1)
  equal(step2.getAttribute('aria-hidden'), 'true')
})
