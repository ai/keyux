import { test } from 'node:test'
import { equal } from 'node:assert'
import { JSDOM, type DOMWindow } from 'jsdom'

import { startKeyUX, createKeyUX } from '../index.js'

function press(
  window: DOMWindow,
  data: Partial<Omit<KeyboardEventInit, 'view'>>,
  target: EventTarget = window,
  onMiddle?: () => void
) {
  let down = new window.KeyboardEvent('keydown', { ...data, bubbles: true })
  target.dispatchEvent(down)
  if (onMiddle) onMiddle()
  let up = new window.KeyboardEvent('keyup', { ...data, bubbles: true })
  target.dispatchEvent(up)
}

test('adds hot keys to buttons and links', () => {
  let window = new JSDOM().window
  startKeyUX(window)
  window.document.body.innerHTML =
    '<button aria-keyshortcuts="b">1</button>' +
    '<button aria-keyshortcuts="Ctrl+B">10</button>' +
    '<button aria-keyshortcuts="plus">100</button>' +
    '<a href="#" aria-keyshortcuts="meta+ctrl+shift+alt+b">1000</a>'

  let result = 0
  let buttons = window.document.querySelectorAll('button, a')
  for (let button of buttons) {
    button.addEventListener('click', () => {
      result += parseInt(button.textContent!)
    })
  }

  press(window, { key: 'b' })
  equal(result, 1)

  press(window, { key: 'b', altKey: true })
  equal(result, 1)

  press(window, { key: 'b' })
  equal(result, 2)

  press(window, { key: 'b', ctrlKey: true })
  equal(result, 12)

  press(window, { key: '+' })
  equal(result, 112)

  press(window, {
    key: 'b',
    ctrlKey: true,
    altKey: true,
    metaKey: true,
    shiftKey: true
  })
  equal(result, 1112)
})

test('stops event tracking', () => {
  let window = new JSDOM().window
  let keyux = startKeyUX(window)
  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'b' })
  equal(clicked, 1)

  keyux.stop()
  press(window, { key: 'b' })
  equal(clicked, 1)

  keyux.start()
  press(window, { key: 'b' })
  equal(clicked, 2)
})

test('creates an instance without starting', () => {
  let window = new JSDOM().window
  let keyux = createKeyUX(window)
  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'b' })
  equal(clicked, 0)

  keyux.stop()
  press(window, { key: 'b' })
  equal(clicked, 0)

  keyux.start()
  press(window, { key: 'b' })
  equal(clicked, 1)

  keyux.stop()
  press(window, { key: 'b' })
  equal(clicked, 1)
})

test('ignores hot keys when focus is inside text fields', () => {
  let window = new JSDOM().window
  startKeyUX(window)
  window.document.body.innerHTML =
    '<input type="text">' +
    '<textarea></textarea>' +
    '<a></a>' +
    '<button aria-keyshortcuts="b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'b' }, window.document.querySelector('input')!)
  equal(clicked, 0)

  press(window, { key: 'b' }, window.document.querySelector('textarea')!)
  equal(clicked, 0)

  press(window, { key: 'b' }, window.document.querySelector('a')!)
  equal(clicked, 1)
})

test('adds pressed state', () => {
  let window = new JSDOM().window
  startKeyUX(window, { pressedClass: 'is-pressed is-hover' })
  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'

  let button = window.document.querySelector('button')!

  equal(button.classList.contains('is-pressed'), false)
  press(window, { key: 'b' }, window, () => {
    equal(button.classList.contains('is-pressed'), true)
    equal(button.classList.contains('is-hover'), true)
  })
  equal(button.classList.contains('is-pressed'), false)
  equal(button.classList.contains('is-hover'), false)
})

test('supports non-English keyboard layouts', () => {
  let window = new JSDOM().window
  startKeyUX(window)
  window.document.body.innerHTML = '<button aria-keyshortcuts="Alt+B"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'и', code: 'KeyB', altKey: true })
  equal(clicked, 1)
})
