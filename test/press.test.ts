import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { hotkeyKeyUX, pressKeyUX, startKeyUX } from '../index.js'
import { keyboardClick, mouseClick } from './utils.js'

test('adds pressed state', () => {
  let window = new JSDOM().window
  startKeyUX(window, [pressKeyUX('is-pressed is-hover'), hotkeyKeyUX()])

  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'
  let button = window.document.querySelector('button')!
  equal(button.classList.contains('is-pressed'), false)

  window.dispatchEvent(
    new window.KeyboardEvent('keydown', { bubbles: true, key: 'b' })
  )
  equal(button.classList.contains('is-pressed'), true)
  equal(button.classList.contains('is-hover'), true)

  window.dispatchEvent(
    new window.KeyboardEvent('keyup', { bubbles: true, key: 'b' })
  )
  equal(button.classList.contains('is-pressed'), false)
  equal(button.classList.contains('is-hover'), false)
})

test('ignores mouse click', () => {
  let window = new JSDOM().window
  startKeyUX(window, [pressKeyUX('is-pressed')])

  window.document.body.innerHTML = '<button></button>'
  let button = window.document.querySelector('button')!
  equal(button.classList.contains('is-pressed'), false)

  keyboardClick(window, button)
  equal(button.classList.contains('is-pressed'), false)

  mouseClick(window, button)
  equal(button.classList.contains('is-pressed'), true)

  window.dispatchEvent(
    new window.KeyboardEvent('keyup', { bubbles: true, key: 'Enter' })
  )
  equal(button.classList.contains('is-pressed'), false)
})

test('stops event tracking', () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [
    pressKeyUX('is-pressed is-hover'),
    hotkeyKeyUX()
  ])

  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'
  let button = window.document.querySelector('button')!

  stop()
  window.dispatchEvent(
    new window.KeyboardEvent('keydown', { bubbles: true, key: 'b' })
  )
  equal(button.classList.contains('is-pressed'), false)
  equal(button.classList.contains('is-hover'), false)
})

test('is ready to pressing 2 buttons', () => {
  let window = new JSDOM().window
  startKeyUX(window, [pressKeyUX('is-pressed'), hotkeyKeyUX()])

  window.document.body.innerHTML =
    '<button aria-keyshortcuts="a" class=""></button>' +
    '<button aria-keyshortcuts="b" class=""></button>'

  window.dispatchEvent(
    new window.KeyboardEvent('keydown', { bubbles: true, key: 'b' })
  )
  window.dispatchEvent(
    new window.KeyboardEvent('keydown', { bubbles: true, key: 'a' })
  )
  window.dispatchEvent(
    new window.KeyboardEvent('keyup', { bubbles: true, key: 'a' })
  )
  window.dispatchEvent(
    new window.KeyboardEvent('keyup', { bubbles: true, key: 'b' })
  )

  equal(
    window.document.body.innerHTML,
    '<button aria-keyshortcuts="a" class=""></button>' +
      '<button aria-keyshortcuts="b" class=""></button>'
  )
})
