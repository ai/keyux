import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { hotkeysKeyUX, pressKeyUX, startKeyUX } from '../index.js'

test('adds pressed state', () => {
  let window = new JSDOM().window
  startKeyUX(window, [pressKeyUX('is-pressed is-hover'), hotkeysKeyUX()])

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

test('stops event tracking', () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [
    pressKeyUX('is-pressed is-hover'),
    hotkeysKeyUX()
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
