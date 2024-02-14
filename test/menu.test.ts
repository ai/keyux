import { type DOMWindow, JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { menuKeyUX, startKeyUX } from '../index.js'

function press(window: DOMWindow, key: string): void {
  let down = new window.KeyboardEvent('keydown', { bubbles: true, key })
  window.document.activeElement!.dispatchEvent(down)
  let up = new window.KeyboardEvent('keyup', { bubbles: true, key })
  window.document.activeElement!.dispatchEvent(up)
}

test('adds menu navigation', () => {
  let window = new JSDOM().window
  startKeyUX(window, [menuKeyUX()])

  window.document.body.innerHTML =
    '<nav role="menu">' +
    '<a href="#" role="menuitem">Home</a>' +
    '<a href="#" role="menuitem">About</a>' +
    '<a href="#" role="menuitem">Contact</a>' +
    '</nav>'
  let items = window.document.querySelectorAll('a')
  items[0].focus()

  equal(window.document.activeElement, items[0])
  equal(
    window.document.body.innerHTML,
    '<nav role="menu">' +
      '<a href="#" role="menuitem">Home</a>' +
      '<a href="#" role="menuitem" tabindex="-1">About</a>' +
      '<a href="#" role="menuitem" tabindex="-1">Contact</a>' +
      '</nav>'
  )

  press(window, 'ArrowDown')
  equal(window.document.activeElement, items[1])
  equal(
    window.document.body.innerHTML,
    '<nav role="menu">' +
      '<a href="#" role="menuitem" tabindex="-1">Home</a>' +
      '<a href="#" role="menuitem" tabindex="0">About</a>' +
      '<a href="#" role="menuitem" tabindex="-1">Contact</a>' +
      '</nav>'
  )

  press(window, 'ArrowUp')
  equal(window.document.activeElement, items[0])

  press(window, 'End')
  equal(window.document.activeElement, items[2])

  press(window, 'Home')
  equal(window.document.activeElement, items[0])

  press(window, 'ArrowUp')
  equal(window.document.activeElement, items[2])
})

test('stops tacking on loosing focus', () => {
  let window = new JSDOM().window
  startKeyUX(window, [menuKeyUX()])

  window.document.body.innerHTML =
    '<nav role="menu">' +
    '<a href="#" role="menuitem">Home</a>' +
    '<a href="#" role="menuitem">About</a>' +
    '<a href="#" role="menuitem">Contact</a>' +
    '</nav>' +
    '<button>Button</button>'
  let button = window.document.querySelector('button')!
  let items = window.document.querySelectorAll('a')

  items[0].focus()
  items[0].blur()

  items[0].focus()
  button.focus()
  press(window, 'ArrowDown')
  equal(window.document.activeElement, button)

  items[0].focus()
  button.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      bubbles: true,
      key: 'ArrowDown'
    })
  )
  equal(window.document.activeElement, items[0])
})

test('supports horizontal menus', () => {
  let window = new JSDOM().window
  startKeyUX(window, [menuKeyUX()])

  window.document.body.innerHTML =
    '<nav role="menu" aria-orientation="horizontal">' +
    '<a href="#" role="menuitem">Home</a>' +
    '<a href="#" role="menuitem">About</a>' +
    '<a href="#" role="menuitem">Contact</a>' +
    '</nav>'
  let items = window.document.querySelectorAll('a')
  items[0].focus()

  press(window, 'ArrowRight')
  equal(window.document.activeElement, items[1])

  press(window, 'ArrowLeft')
  equal(window.document.activeElement, items[0])
})

test('supports RTL locales', () => {
  let window = new JSDOM().window
  startKeyUX(window, [menuKeyUX()])

  window.document.dir = 'rtl'
  window.document.body.innerHTML =
    '<nav role="menu" aria-orientation="horizontal">' +
    '<a href="#" role="menuitem">Home</a>' +
    '<a href="#" role="menuitem">About</a>' +
    '<a href="#" role="menuitem">Contact</a>' +
    '</nav>'
  let items = window.document.querySelectorAll('a')
  items[0].focus()

  press(window, 'ArrowLeft')
  equal(window.document.activeElement, items[1])

  press(window, 'ArrowRight')
  equal(window.document.activeElement, items[0])
})

test('stops event tracking', () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [menuKeyUX()])

  window.document.body.innerHTML =
    '<nav role="menu">' +
    '<a href="#" role="menuitem">Home</a>' +
    '<a href="#" role="menuitem">About</a>' +
    '<a href="#" role="menuitem">Contact</a>' +
    '</nav>'
  let items = window.document.querySelectorAll('a')
  items[0].focus()

  press(window, 'ArrowDown')
  equal(window.document.activeElement, items[1])

  stop()
  press(window, 'ArrowDown')
  equal(window.document.activeElement, items[1])
})
